resource "google_service_account" "runtime" {
  account_id   = "${var.prefix}-run"
  display_name = "${var.project_name} Cloud Run runtime (${var.environment})"
  description  = "Identity the backend service and the nightly jobs run as. Reads its own secrets; nothing else."
}

resource "google_secret_manager_secret_iam_member" "runtime_secrets" {
  for_each = toset(var.runtime_secret_ids)

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "runtime_telemetry" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_service_account_iam_member" "runtime_signs_as_itself" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_service_account" "deployer" {
  account_id   = "${var.prefix}-deployer"
  display_name = "${var.project_name} CI deployer (${var.environment})"
  description  = "Identity for GitHub Actions: pushes backend images and rolls Cloud Run revisions."
}

resource "google_artifact_registry_repository_iam_member" "deployer_push" {
  location   = var.artifact_repository_location
  repository = var.artifact_repository_id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_project_iam_member" "deployer_run" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_service_account_iam_member" "deployer_act_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_project_iam_member" "deployer_extra" {
  for_each = toset(var.deployer_extra_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_service_account_key" "deployer" {
  count = var.create_deployer_key ? 1 : 0

  service_account_id = google_service_account.deployer.name
}

resource "google_service_account" "scheduler" {
  account_id   = "${var.prefix}-scheduler"
  display_name = "${var.project_name} Cloud Scheduler (${var.environment})"
  description  = "Identity Cloud Scheduler authenticates as when it starts a nightly Cloud Run Job."
}
