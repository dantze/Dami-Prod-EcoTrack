locals {
  secret_env_keys = nonsensitive(toset(keys(var.secret_env)))
  job_profiles    = "${var.spring_profiles_active},job"
}

resource "google_secret_manager_secret" "extra" {
  for_each = local.secret_env_keys

  secret_id = "${var.prefix}-${lower(replace(each.key, "_", "-"))}"
  labels    = var.labels

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "extra" {
  for_each = local.secret_env_keys

  secret      = google_secret_manager_secret.extra[each.key].id
  secret_data = var.secret_env[each.key]
}

resource "google_secret_manager_secret_iam_member" "runtime_extra" {
  for_each = local.secret_env_keys

  secret_id = google_secret_manager_secret.extra[each.key].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.runtime_service_account}"
}

resource "google_cloud_run_v2_service" "backend" {
  name                = "${var.prefix}-${var.service_name}"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  labels              = var.labels
  deletion_protection = false

  template {
    service_account                  = var.runtime_service_account
    timeout                          = "300s"
    max_instance_request_concurrency = 80
    labels                           = var.labels

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        network    = var.network_id
        subnetwork = var.subnetwork_id
      }
    }

    containers {
      image = var.image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }

        startup_cpu_boost = true
      }

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = var.spring_profiles_active
      }

      env {
        name  = "DB_HOST"
        value = var.db_host
      }

      env {
        name  = "DB_PORT"
        value = var.db_port
      }

      env {
        name  = "DB_NAME"
        value = var.db_name
      }

      env {
        name  = "DB_USER"
        value = var.db_user
      }

      env {
        name = "DB_PASS"
        value_source {
          secret_key_ref {
            secret  = var.db_password_secret_id
            version = "latest"
          }
        }
      }

      dynamic "env" {
        for_each = var.plain_env
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = local.secret_env_keys
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.extra[env.value].secret_id
              version = "latest"
            }
          }
        }
      }

      startup_probe {
        initial_delay_seconds = 10
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 30

        http_get {
          path = "/actuator/health"
          port = var.container_port
        }
      }

      liveness_probe {
        period_seconds    = 30
        timeout_seconds   = 5
        failure_threshold = 3

        http_get {
          path = "/actuator/health"
          port = var.container_port
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  count = var.allow_public_access ? 1 : 0

  project  = google_cloud_run_v2_service.backend.project
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_job" "nightly" {
  for_each = var.jobs

  name                = "${var.prefix}-${each.key}"
  location            = var.region
  labels              = var.labels
  deletion_protection = false

  template {
    task_count = 1
    labels     = var.labels

    template {
      service_account = var.runtime_service_account
      max_retries     = 1
      timeout         = "600s"

      vpc_access {
        egress = "PRIVATE_RANGES_ONLY"

        network_interfaces {
          network    = var.network_id
          subnetwork = var.subnetwork_id
        }
      }

      containers {
        image = var.image

        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }

        env {
          name  = "SPRING_PROFILES_ACTIVE"
          value = local.job_profiles
        }

        env {
          name  = "ECOTRACK_JOB"
          value = each.key
        }

        env {
          name  = "DB_HOST"
          value = var.db_host
        }

        env {
          name  = "DB_PORT"
          value = var.db_port
        }

        env {
          name  = "DB_NAME"
          value = var.db_name
        }

        env {
          name  = "DB_USER"
          value = var.db_user
        }

        env {
          name = "DB_PASS"
          value_source {
            secret_key_ref {
              secret  = var.db_password_secret_id
              version = "latest"
            }
          }
        }

        dynamic "env" {
          for_each = var.plain_env
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = local.secret_env_keys
          content {
            name = env.value
            value_source {
              secret_key_ref {
                secret  = google_secret_manager_secret.extra[env.value].secret_id
                version = "latest"
              }
            }
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
    ]
  }
}

resource "google_cloud_run_v2_job_iam_member" "scheduler_invoker" {
  for_each = var.jobs

  project  = google_cloud_run_v2_job.nightly[each.key].project
  location = google_cloud_run_v2_job.nightly[each.key].location
  name     = google_cloud_run_v2_job.nightly[each.key].name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.scheduler_service_account}"
}

resource "google_cloud_scheduler_job" "nightly" {
  for_each = var.jobs

  name             = "${var.prefix}-${each.key}"
  region           = var.region
  schedule         = each.value
  time_zone        = var.scheduler_time_zone
  attempt_deadline = "320s"

  http_target {
    http_method = "POST"
    uri         = "https://run.googleapis.com/v2/${google_cloud_run_v2_job.nightly[each.key].id}:run"

    oauth_token {
      service_account_email = var.scheduler_service_account
      scope                 = "https://www.googleapis.com/auth/cloud-platform"
    }
  }

  depends_on = [google_cloud_run_v2_job_iam_member.scheduler_invoker]
}
