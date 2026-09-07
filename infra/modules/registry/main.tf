resource "google_artifact_registry_repository" "backend" {
  location      = var.region
  repository_id = "${var.prefix}-${var.repository_id}"
  description   = var.description
  format        = "DOCKER"
  labels        = var.labels

  cleanup_policies {
    id     = "keep-recent-releases"
    action = "KEEP"

    most_recent_versions {
      keep_count = var.keep_recent_count
    }
  }

  cleanup_policies {
    id     = "delete-stale"
    action = "DELETE"

    condition {
      older_than = "2592000s"
    }
  }
}
