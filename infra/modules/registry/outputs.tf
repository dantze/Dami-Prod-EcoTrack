output "repository_id" {
  value = google_artifact_registry_repository.backend.repository_id
}

output "repository_location" {
  value = google_artifact_registry_repository.backend.location
}

output "host" {
  value = "${var.region}-docker.pkg.dev"
}

output "image_repository" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.backend.repository_id}/${var.image_name}"
}
