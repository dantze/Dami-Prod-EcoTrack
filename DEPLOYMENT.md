# Deployment

Backend on **Cloud Run**, database on **Cloud SQL** (PostgreSQL), task photos in
**Cloud Storage**, frontend on **Vercel**. The GCP half is described by Terraform in `infra/`; the Vercel
project is created by hand and `build-web.yml` writes its two build-time
variables on every build.

> **This replaced a single DigitalOcean droplet** running backend + web +
> Postgres + Caddy as one `docker compose` stack. That droplet is gone, and the
> workflow that deployed to it had been gated off since TODO-32.
> `docker-compose.yml` survives as Postgres + the backend, for local work only
> (TODO-91).

## Triggers

**Merging never deploys, and the button never builds.** Two phases:

**On merge to main, automatically** — the artifact is produced and parked where
no user can reach it:

| Workflow | Runs | Parks it |
|---|---|---|
| `build-backend` | `ci-backend` → docker build | Artifact Registry, tag `sha-<commit>` |
| `build-web` | `ci-web` → `vercel build` | GitHub artifact `web-bundle-<commit>` |
| `build-mobile` | `ci-mobile` → `eas update` | EAS branch **`staging`** (no phone follows it) |

**When you decide, Actions → Run workflow** — the button promotes what is
already there:

| Button | Does | Takes |
|---|---|---|
| **Deploy Backend** | points Cloud Run service + both jobs at `sha-<commit>`, smoke-tests | ~1 min |
| **Deploy Web** | downloads the bundle, `vercel deploy --prebuilt --prod` | ~1 min |
| **Deploy Mobile** | `eas update:republish` staging → production | seconds |

No button runs a test suite or a compiler, because the build already did both.
**A deploy refuses if the artifact is missing** — you cannot ship a commit that
was never built. **A missing secret fails a deploy** loudly; a *build* only
skips, because it is automatic and a red main would be wrong.

Rollback is the same button: `image_tag` on Deploy Backend and `commit` on
Deploy Web take any older artifact.

**Native mobile is the exception.** `eas build` compiles native code, so the
`build-preview` and `build-production` actions on Deploy Mobile genuinely build
(~20 min) and then need a store review. Use them only for a new native module,
an SDK bump, a plugin/permission change, or an `expo.version` bump.

Infrastructure is not a button: `terraform apply` is run from a laptop while
state is a local file (TODO-92). `ci-infra.yml` still gates every PR touching
`infra/`.

**Order matters in one case only.** The web bundle has the backend URL inlined,
and `build-web` reads it from Cloud Run — so the backend must exist before web
can be *built*, not before it is deployed. A Cloud Run URL is stable across
redeploys, so after the first time the two are independent. `build-web` refuses
if the service is missing rather than producing a bundle that talks to nothing.

## The shape, and the one thing it changed

```
Vercel (static SPA, web/)  ──HTTPS──▶  Cloud Run service (backend/)
        ▲                                       │
        │ VITE_API_BASE_URL, written by         │ private IP, VPC egress
        │ Terraform from the Cloud Run URL      ▼
        └───────────────────────────────  Cloud SQL (PostgreSQL 16)
                                                ▲
Cloud Scheduler ──▶ Cloud Run jobs ×2 ──────────┘
  02:00 / 03:30      same image, `job` profile
```

**Two origins, so CORS is load-bearing.** On the droplet, Caddy served the SPA
and proxied `/api` on one domain, so the browser's API call was same-origin and
CORS never applied. It applies now: `infra/main.tf` computes
`ECOTRACK_CORS_ALLOWED_ORIGINS` from the Vercel project name plus any custom
domains and sets it on the Cloud Run service.

That is the failure this deployment can produce that the old one could not — and
it is invisible from either side. Cloud Run answers `/actuator/health` happily,
Vercel serves the bundle happily, and the browser refuses every call between
them. **If the app loads but every list is empty, open the console before
anything else.** Renaming the Vercel project without re-applying Terraform is
the way to cause it.

The database has **no public IP**. Cloud Run reaches it over direct VPC egress,
which is why `infra/` creates a VPC at all — the Cloud SQL Auth proxy presents a
unix socket, and the plain Postgres JDBC driver the backend uses cannot dial one.
To reach it yourself, see *Getting a shell on the database* below.

## One-time setup

**1. Accounts.** A GCP project with **billing enabled**, and a Vercel account.
Budget **~$15/month** before any traffic — see *Costs* below. Vercel Hobby is
free.

**1b. Create the Vercel project by hand**, once. Terraform does not manage it —
everything it would manage is a one-time setting, and having it managed meant a
Vercel token in the blast radius of every `terraform apply`. Import the repo, or
`vercel link` from `web/`, and set:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `web` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Ignored build step | `git diff --quiet HEAD^ HEAD -- web shared` |

Leave the environment variables alone: `build-web.yml` writes
`VITE_API_BASE_URL` and `VITE_DATA_MODE` before each build, and overwrites
whatever is there. **Do not connect the project to GitHub** — a Git-connected
Vercel project deploys on its own push webhook, which puts `main` in production
without anyone pressing the button. Note
the project **name** — it has to match the `VERCEL_PROJECT_NAME` variable below,
because that is what the backend's allowed CORS origins are computed from — and
the project **id**, which is the `VERCEL_PROJECT_ID` secret.

**2. Apply the infrastructure once, from a laptop.**

```bash
gcloud auth application-default login
gcloud config set project <your-project-id>

cd infra
cp terraform.tfvars.example terraform.tfvars   # gitignored
# fill in gcp_project_id (the only value with no default)

terraform init
terraform plan          # read it: ~30 resources, and it starts billing
terraform apply         # 15–25 min, nearly all of it Cloud SQL
terraform output
```

The first apply enables nine service APIs, so the very first `plan` can fail
with `API has not been used in project … before`. Re-run it once.

Afterwards, the database password is in Secret Manager and nowhere else:

```bash
gcloud secrets versions access latest \
  --secret="$(terraform output -raw database_password_secret_id)"
```

The Cloud Run service and both jobs start on a Google placeholder image, not the
backend — the real image does not exist until CI pushes one. That is deliberate,
and Terraform marks all three image fields `ignore_changes` so a later `apply`
never rolls a deployed revision back to the placeholder. The deploy workflow is
what rolls the image onto the service *and* onto each job.

**3. Move Terraform state to GCS before CI applies anything.** `infra/providers.tf`
ships with no backend block, so state is a local file. A GitHub runner starts
with an empty checkout: run 1 creates everything, run 2 sees empty state and
tries to create it all again, failing on a dozen "already exists" errors with no
way to import what run 1 made except by hand.

```bash
gcloud storage buckets create gs://<your-tf-state-bucket> \
  --location=europe-west1 --uniform-bucket-level-access
gcloud storage buckets update gs://<your-tf-state-bucket> --versioning
```

Then add the block to `infra/providers.tf` and run `terraform init -migrate-state`:

```hcl
terraform {
  backend "gcs" {
    bucket = "<your-tf-state-bucket>"
    prefix = "ecotrack/infra"
  }
}
```

The workflow prints a warning on every run until you do. State holds every value
Terraform read or generated, the database password among them — the bucket is as
sensitive as the secret.

**4. GitHub → Settings → Secrets and variables → Actions → Secrets:**

```
GCP_CREDENTIALS_JSON   GCP_PROJECT_ID
VERCEL_API_TOKEN       VERCEL_ORG_ID       VERCEL_PROJECT_ID
EXPO_TOKEN                       # expo.dev → Account → Access tokens
```

`VERCEL_PROJECT_ID` comes from the project you made in step 1b — Settings →
General, or `.vercel/project.json` after `vercel link`. For a Team account,
`VERCEL_ORG_ID` is the team id and the CLI needs nothing else.

Optional:

```
BACKEND_SECRETS_JSON     # {"SOME_KEY":"…"} — nothing needs it today
```

`BACKEND_SECRETS_JSON` is how a credential would reach the container: each key
becomes its own Secret Manager secret, readable only by the Cloud Run runtime
service account. **Nothing needs it.** Task photos moved to a GCS bucket the
runtime service account can write without a key (TODO-79), and the database
password is Terraform's. Leave it unset.

**The complete secret list, after that move:**

| Secret | Where it comes from | Where it lives | How to read it back |
|---|---|---|---|
| DB password | Terraform generates it | Secret Manager `ecotrack-dev-db-password`, and plaintext in `terraform.tfstate` | `gcloud secrets versions access latest --secret=ecotrack-dev-db-password` |
| `ECOTRACK_SETUP_CODE` | optional; unset means the backend generates one and logs it | log only, unless you set it | `gcloud run services logs read` |
| `GCP_CREDENTIALS_JSON`, `VERCEL_API_TOKEN`, `EXPO_TOKEN` | you create them | GitHub secrets only — never stored in GCP | the issuing console |

That is the whole list. Task photo storage needs no credential at all: the
container has an identity, and the bucket's IAM policy names it.

**Variables** (Settings → Variables, not secrets; defaults shown):

```
GCP_REGION=europe-west1        VERCEL_PROJECT_NAME=ecotrack-web
RESOURCE_PREFIX=ecotrack-dev   # must equal project_name + "-" + environment in infra/
EXPO_PUBLIC_API_BASE_URL=      # the Cloud Run URL + /api — see below
EXPO_PUBLIC_WEB_APP_URL=       # the Vercel URL — `terraform output -raw frontend_url`
```

`EXPO_PUBLIC_WEB_APP_URL` is a **second** variable rather than the first one
with `/api` removed: the SPA and the API are on different origins now, so the
office signpost in the app cannot compute one from the other (TODO-84). Deploy
Mobile warns and still ships without it — the screen then says it does not know
the address instead of guessing.

**5. Decide who may run `terraform apply`.** Terraform creates three service
accounts, each with the smallest role set that does its job:

- **`<prefix>-run`** — what the Cloud Run service *and* both jobs run as. It
  reads its own secrets (granted per secret, not project-wide) and writes logs
  and metrics. Nothing else. Notably it is *not* the default Compute Engine
  service account, which carries project-wide `roles/editor`.
- **`<prefix>-deployer`** — for CI. `artifactregistry.writer` on this repository
  only, `run.developer` (deploy revisions and update jobs, but not rewrite the
  service's IAM policy, so a stolen CI token cannot open the API to the world),
  and `serviceAccountUser` on the runtime account alone.
- **`<prefix>-scheduler`** — what Cloud Scheduler authenticates as. `run.invoker`
  on the two nightly jobs and nothing else.

**The deployer cannot run `terraform apply`.** Creating SQL instances, service
accounts, IAM bindings and VPC peerings needs admin roles across most of the
project — roughly `cloudsql.admin` + `secretmanager.admin` +
`iam.serviceAccountAdmin` + `resourcemanager.projectIamAdmin` +
`compute.networkAdmin` + `run.admin` + `serviceusage.serviceUsageAdmin`, which
together is close to owner. Granting that to the identity that also builds
container images defeats the split. Three options, best first:

1. **Apply from a laptop, let CI ship images.** Infrastructure changes rarely;
   images change every commit. Run the `terraform` job on pull requests for
   `plan` only and remove the `apply` step. `GCP_CREDENTIALS_JSON` then only
   ever holds the narrow deployer.
2. **A separate `terraform-admin` identity**, its key in a GitHub *environment*
   with required reviewers, so an apply needs a human click.
3. **`deployer_extra_roles`** — grant the deployer the admin roles above and
   accept that CI holds near-owner. Off by default; it is a decision, not a
   default.

**Prefer Workload Identity Federation over a key.** `create_deployer_key = true`
writes a never-expiring private key into `terraform.tfstate` **in plaintext**,
which makes the state file as sensitive as the key. WIF issues short-lived
tokens to this repo instead, with no key anywhere:

```bash
gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github \
  --location=global --workload-identity-pool=github \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository \
  --attribute-condition="assertion.repository=='<owner>/<repo>'"

gcloud iam service-accounts add-iam-policy-binding \
  "$(terraform output -raw deployer_service_account)" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/attribute.repository/<owner>/<repo>"
```

Keep the `--attribute-condition`: without it, **any** GitHub repository can mint
tokens for your service account. Then swap the two commented lines in
the deploy workflows' auth step for `credentials_json`.

**6. Mobile.** Set the `EXPO_PUBLIC_API_BASE_URL` **variable** to
`terraform output -raw backend_api_base_url` plus `/api`, then run Deploy Mobile.
`EXPO_PUBLIC_*` is inlined by the bundler, so nothing in the field is repointed
until an update ships; the workflow refuses to ship at all while the variable is
unset. Phones in the field were bundled against the droplet — the cutover below
is what moves them.

**7. Custom domains** (optional). **Two places, and both are needed.** Add the
domain to the Vercel project and point DNS at Vercel; then add it to
`web_custom_domains` in `terraform.tfvars` and re-apply, which is what puts it
in the backend's allowed CORS origins. Doing only the first gives you a domain
that loads the app and cannot call the API. The backend keeps its `*.run.app`
URL — there is no custom domain for the API.

## Costs

Roughly, `europe-west1`, defaults as written:

| | |
|---|---|
| Cloud SQL `db-f1-micro`, 10 GB, ZONAL | ~$10/mo, and it runs 24/7 whether or not anyone uses the app |
| Cloud Run service + the two nightly jobs | ~$5/mo — request-billed, scaled to zero out of hours |
| Artifact Registry | ~$0.10/GB/mo, capped by the cleanup policy |
| Cloud Storage, VPC, Secret Manager, Cloud Scheduler | cents at this volume |
| Vercel Hobby | $0 |

**~$15/month** before any traffic. Cloud SQL is the whole bill and is the one
line that cannot scale to zero — it has no idle mode. The backend can, and does:
`backend_min_instances` is 0 and there is no `cpu_idle` override, so an idle
service costs nothing and the first request of the morning pays a JVM cold
start. That is the accepted trade (TODO-80); it only became available once the
nightly jobs stopped needing a live JVM.

`db-f1-micro` is shared-core and carries **no SLA** — fine for a first deploy,
not for customers. `terraform destroy` will refuse while
`db_deletion_protection = true`, which is the point.

## First enrolment

**There is no password and no sign-up.** The first access request on an empty
database becomes ADMIN, and it must carry a one-time code. Two ways to get one:

**A. Choose it up front (nothing to read from a log).** Put it in
`BACKEND_SECRETS_JSON` as `ECOTRACK_SETUP_CODE`, or in `backend_secrets` in
`terraform.tfvars`, before the first deploy.

```bash
openssl rand -base64 18        # 12 characters minimum, or it is IGNORED
```

It is **inert the moment one employee exists**, so it is not a standing
credential — but rotate it afterwards anyway, and never reuse it as the lockout
recovery code (it is not accepted as one).

**B. Read the generated one** (what happens when it is unset):

```bash
gcloud run services logs read "$(cd infra && terraform output -raw backend_service_name)" \
    --region "$(cd infra && terraform output -raw backend_region)" --limit 200 \
  | grep -A4 'First-run admin code'
```

Then: open the app → *Solicită acces* → name + the code → the device is ADMIN
immediately and everyone else's requests go to that admin for approval.

## Recovering when no admin can sign in

If the **last** admin logs out or loses their only device, nobody is left to
approve anything. The server detects this and logs a single-use recovery code:

```bash
gcloud run services logs read "$(cd infra && terraform output -raw backend_service_name)" \
    --region "$(cd infra && terraform output -raw backend_region)" --limit 200 \
  | grep -A6 'Admin recovery code'
```

Enter it on the access-request screen (the field is labelled *Cod de recuperare*
and only appears in this state) and it mints a **new** ADMIN. The old admin's
row survives with no sessions — delete it in Angajați afterwards if it is a
duplicate.

The code is minted when the state is first observed, so hit `/api/enrollment/status`
(just open the app) if nothing is in the log yet. It is **not** the same as
`ECOTRACK_SETUP_CODE`, which is deliberately not accepted here.

**Scale-to-zero note:** `backend_min_instances` is 0, so an idle service has no
running instance and therefore no recent logs. Open the app once to wake it
before grepping.

## Rollback

Neither half rolls back by reverting a commit alone — both platforms keep the
previous version, and pointing at it is faster than a rebuild.

**Backend** — list revisions and send traffic to the previous one:

```bash
gcloud run revisions list --service <service> --region <region>
gcloud run services update-traffic <service> --region <region> --to-revisions <revision>=100
```

**Frontend** — Vercel dashboard → Deployments → the previous one → *Promote to
Production*. Instant; it is a served build, not a rebuild.

Then revert the commit so the next deploy does not re-ship it. Mobile OTA:
`eas update:republish --branch production`.

**There is no database rollback.** `ddl-auto=update` never drops anything, so a
schema change is not undone by deploying the old image. Cloud SQL keeps 7 days
of automated backups and point-in-time recovery — restoring is a `gcloud sql`
operation on the instance, not part of this pipeline.

## Getting a shell on the database

The instance has no public IP, so the Cloud SQL Auth proxy is the only way in
from outside the VPC:

```bash
cd infra
gcloud sql connect "$(terraform output -raw database_instance_name)" --user=ecotrack
# password:
gcloud secrets versions access latest --secret="$(terraform output -raw database_password_secret_id)"
```

## Local

**Docker is not required to run this app locally.** The everyday loop is two
commands and no containers:

```bash
cd backend && ./gradlew bootRun     # H2 file DB at backend/data/damiprod
cd web     && npm run dev           # http://localhost:5173, mock data
```

Docker buys exactly one thing: **the backend against real Postgres**, which is
what production runs and what H2 is not. `ddl-auto=update` with no migration
tool makes that gap worth closing before anything schema-shaped ships.

```bash
docker compose up -d --build
cd web && VITE_DATA_MODE=live VITE_API_BASE_URL=http://localhost:8080/api npm run dev
```

Every compose value has a default, so there is no `.env` to copy. Override one
inline (`DB_PASS=… docker compose up -d`) or in a gitignored `.env` if you want
to. `ECOTRACK_CORS_ALLOWED_ORIGINS` already defaults to include
`http://localhost:5173`, which is what lets the Vite dev server call it.

This is **two origins** — the SPA on 5173, the API on 8080 — which is the shape
production has. The full-stack Caddy recipe that used to be here was one origin
and is gone (TODO-91): it could not reproduce a CORS failure, and it taught a
layout no deployment has any more. Two things still will not work locally: task
photo upload needs a real GCS bucket and Application Default Credentials, and
the nightly jobs are Cloud Run Jobs, so run them with
`ECOTRACK_JOB=generate-tasks ./gradlew bootRun --args='--spring.profiles.active=prod,job'`
if you need to exercise one.

## Mobile cutover — moving the phones off the droplet (TODO-72)

Two changes landed in `mobile/` that the phones in the field have not seen:
TODO-33 deleted the Sales and Technical sections, and TODO-71 retired the
DigitalOcean droplet those phones still call. Both are delivered from here.

**Most of it goes over the air, which is the counter-intuitive part.**
`EXPO_PUBLIC_*` is inlined by the *bundler*, and `eas update` bundles — so an
OTA carries a new `EXPO_PUBLIC_API_BASE_URL` to installed apps, and it carries
the deleted screens too, because screens are JS. `expo.version` has not moved
since before TODO-33 (`1.2.0`) and `runtimeVersion` is `appVersion`, so every
install in the field is still in range of an update. What an OTA cannot remove
is native: the compiled-in modules TODO-33 stopped using, and the Maps key
`app.config.js` used to write into the Android manifest.

Do it in this order. Each step is safe to stop after.

**1. Set the variables.** Settings → Secrets and variables → Actions →
*Variables* → `EXPO_PUBLIC_API_BASE_URL` = `terraform output -raw
backend_api_base_url`, and `EXPO_PUBLIC_WEB_APP_URL` = `terraform output -raw
frontend_url`. Deploy Mobile fails its *Require a backend URL* step without the
first, on purpose: an update reaches every phone, and a bundle with no backend
in it calls `http://localhost:8080/api`, which on a phone is the phone. The
second only warns. Setting the first to an `https://` URL is also what turns the
Android cleartext-HTTP exemption off for this build (TODO-85).

**2. Ship the OTA.** Actions → Deploy Mobile → `update`, branch `production`.
Phones pick it up on next launch. After this they call Cloud Run and no longer
render Sales or Technical.

**3. Confirm rollout before touching anything else.** expo.dev → the project →
Updates shows adoption. A phone that has been offline or unopened is still on
the old bundle, still calling the dead droplet, and still showing office
screens.

**4. Revoke `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.** Google Cloud console →
APIs & Services → Credentials → delete the key. **This is the half that stops it
billing** — nothing in this repository reads it any more (TODO-33 removed it
from `app.config.js`, `deploy-mobile.yml` and the secret list above), but a key
is live until Google says otherwise, and an old binary still has it baked into
its manifest. Delete the GitHub secret in the same pass. Do this *after* step 3:
the key is only reachable from the map on the old Sales screens, and step 2 is
what removes those.

**5. Native rebuild, when convenient.** Actions → Deploy Mobile →
`build-production`. This is the only step that drops the now-dead native modules
(`react-native-maps`, ML Kit text recognition, the calendar and draggable-list
packages) from the binary, **and the only one that closes the Android
cleartext-HTTP exemption** (TODO-85) — `usesCleartextTraffic` is a manifest
attribute, so no OTA can change it, and it is computed from
`EXPO_PUBLIC_API_BASE_URL` at build time: an `https://` backend builds it
`false`. Nothing is broken until this runs — unused native weight and a
permission nothing exercises, not a fault — so it can ride along with the next
release rather than being its own event. Bump `expo.version` and
`android.versionCode` when you do.

## Legacy ID photos — drained, and how to check anyway

EcoTrack no longer stores photographs of identity documents (TODO-14), and as of
TODO-45 nothing records that it once did: `Individual.idPhotoUrl`,
`IndividualRepository` and the `/api/admin/id-photos` purge endpoint are all
deleted. The owner confirmed no photos were ever uploaded — the app has not left
development — and no committed database ever held a single stored URL.

**One thing survives that deletion on purpose: the prefix.** ID photos were
written under **`persoane fizice/`, with the space** — recovered from
`PhotosController.clientIdsFolderName` before that class was deleted, and never
written down anywhere else. It is kept here because it is what makes the check
below possible now that the column is gone: an object can still be found by
prefix even though nothing in the database points at it. Task photos live under
a different prefix and must be left alone.

These commands talk to the **old DigitalOcean Spaces bucket**, which the app no
longer uses at all (TODO-79) — running them is the last thing that bucket is
for. You need the Spaces keys from the DigitalOcean panel; the application no
longer holds them.

```bash
# DigitalOcean Spaces is S3-compatible; use the region endpoint.
# Needs the Spaces keys and nothing else — no running server.
aws s3 ls "s3://$DO_SPACES_BUCKET/persoane fizice/" \
    --endpoint-url "https://$DO_SPACES_REGION.digitaloceanspaces.com" \
    --recursive --human-readable --summarize
```

Expected: nothing. **If it ever lists objects**, they are scans of identity
documents written with a public-read ACL — a working unauthenticated URL each —
and nothing in the application can find or delete them any more. Delete them
with the keys directly:

```bash
aws s3 rm "s3://$DO_SPACES_BUCKET/persoane fizice/" \
    --endpoint-url "https://$DO_SPACES_REGION.digitaloceanspaces.com" --recursive
```

### Dropping the column

`ddl-auto=update` never drops anything, so `individual.id_photo_url` outlives
the field that mapped it — in H2 and in Postgres, exactly like the orphaned
`intake_message` / `order_draft` tables from TODO-15. Nothing reads it and
nothing writes it, so this is tidiness rather than a fix. Per environment:

```sql
ALTER TABLE individual DROP COLUMN id_photo_url;
```

The local H2 file is `backend/data/damiprod`; the local Postgres is
`docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"`; Cloud SQL is
*Getting a shell on the database* above. Run the bucket check above first if it
has not been run for that environment — the column is the last thing that would
have told you which objects existed.

## Task photos, and decommissioning Spaces

Photos go to the GCS bucket Terraform creates, `ecotrack-dev-photos`. There is
**no key**: the Cloud Run runtime service account holds `objectAdmin` on that
bucket and the SDK authenticates as it. Two bucket settings are the privacy
guarantee, and both are enforced by the platform rather than by our code —
`uniform_bucket_level_access` refuses per-object ACLs and
`public_access_prevention = "enforced"` refuses a public IAM binding. So the
one-time ACL fix that used to live here has nothing to fix: the bucket is new
and cannot hold a public object.

Reads are short-lived V4-signed URLs (TODO-46). Signing has no private key to
work with, so it calls the IAM `signBlob` API — which is why the runtime service
account holds `roles/iam.serviceAccountTokenCreator` **on itself**. If photo
links start returning 403 while uploads still work, that binding is what to
check first.

**Then delete the Spaces bucket.** Nothing reads it any more. Run the
`persoane fizice/` check in the section above first — it is the last chance to
find a stray ID photo — then check `poze cabine/` the same way, and once both
are dealt with, delete the bucket in the DigitalOcean panel and **revoke the
Spaces access keys**. They are no longer in GitHub, in Secret Manager, or in the
container, so nothing breaks when they die.

## Gotchas

- `ECOTRACK_SECURITY_ENFORCE=true` logs out every device on a pre-token build.
  Ship mobile, confirm rollout, *then* flip.
- **Renaming the Vercel project breaks CORS until Terraform is re-applied.**
  The allowed-origin list is computed from `vercel_project_name`, and nothing
  reads it back off Vercel — the app will load and every call will be refused.
  Same for a custom domain added only on the Vercel side.
- **Vercel build settings are not in version control.** Root directory, build
  command and the ignored-build-step are dashboard state since Terraform stopped
  managing the project; the values are in step 1b. The two `VITE_*` variables
  are the exception — `build-web.yml` overwrites them on every build.
- `VITE_*` / `EXPO_PUBLIC_*` are **bundle-time**, not runtime — changing one and
  restarting the app does nothing. But bundle-time is not the same as *binary*
  time on mobile: `eas update` re-bundles, so an OTA does repoint an installed
  app at a new `EXPO_PUBLIC_API_BASE_URL`. Only native changes need `eas build`.
- `runtimeVersion` is `appVersion`: bumping `expo.version` fences OTAs off from
  older installs until they get a new binary. Intentional.
- No DB migrations (`ddl-auto=update`). Destructive schema changes are manual,
  and `db_deletion_protection` in `infra/` is what stops `terraform destroy`
  taking the schema with it. Keep it `true`.
- The web build downloads the ID scanner's language model once, from a pinned
  `tessdata_fast` tag, verified against a SHA-256 in
  `web/scripts/fetch-ocr-assets.mjs`. **A web build needs network for that**, and
  fails loudly rather than shipping a scanner with no model. This runs on
  Vercel's builder now, not in a Docker image.
- **The nightly work is two Cloud Run Jobs, not a `@Scheduled` method.** The
  recurring-task top-up (02:00) and the session prune (03:30) run as separate
  one-shot executions of the same image, under `SPRING_PROFILES_ACTIVE=prod,job`
  with `ECOTRACK_JOB` naming which one. Cloud Scheduler starts them, in
  `Europe/Bucharest`. So `backend_min_instances` is free to be 0 (TODO-80), and
  `backend_max_instances` is free to be raised — one execution runs one process,
  not one per serving instance (TODO-81).
- **A deploy must roll the jobs as well as the service.** All three ignore
  Terraform's `image`, so the `gcloud run jobs update` step in
  `deploy-backend.yml` is
  what keeps the nightly jobs on the same commit as the API. A job left behind
  fails silently at 02:00, in a place nobody is looking.
- **Check a job by running it, not by waiting for 02:00:**
  `gcloud run jobs execute <prefix>-generate-tasks --region <region> --wait`.
  A non-zero exit means the run failed; an unknown or unset `ECOTRACK_JOB` is
  one of the ways it can.
- `infra/.terraform.lock.hcl` **is committed**, with hashes recorded for
  `linux_amd64` as well as `darwin_arm64` — a lock file carrying only local
  hashes makes `terraform init` fail on the Ubuntu runner. After adding a
  provider: `terraform providers lock -platform=windows_amd64 -platform=linux_amd64 -platform=darwin_arm64`.
- **There is no mobile ID scanner any more.** It went with the Sales section in
  TODO-33 — creating a client is a web-app job now, and the web scanner runs
  tesseract.js in the browser with no native module involved. This entry used to
  warn that `@react-native-ml-kit/text-recognition` could not ship over the air;
  the package is gone, and the general rule it was an instance of is the
  `EXPO_PUBLIC_*` bullet above.
