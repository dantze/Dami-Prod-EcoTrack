output "backend_url" {
  description = "Public HTTPS URL of the Cloud Run backend."
  value       = module.backend.service_uri
}

output "backend_api_base_url" {
  description = "What the frontend calls: the Cloud Run URL plus /api."
  value       = "${module.backend.service_uri}/api"
}

output "backend_service_name" {
  description = "Cloud Run service name."
  value       = module.backend.service_name
}

output "backend_job_names" {
  description = "Cloud Run Job names. CI rolls the new image onto each of them."
  value       = module.backend.job_names
}

output "backend_region" {
  description = "Region the Cloud Run service and Cloud SQL instance live in."
  value       = var.gcp_region
}

output "artifact_registry_host" {
  description = "Docker registry host to authenticate against."
  value       = module.registry.host
}

output "backend_image_repository" {
  description = "Full image path without a tag."
  value       = module.registry.image_repository
}

output "database_instance_name" {
  description = "Cloud SQL instance name."
  value       = module.database.instance_name
}

output "database_connection_name" {
  description = "project:region:instance, for gcloud sql connect and the auth proxy."
  value       = module.database.connection_name
}

output "database_private_ip" {
  description = "DB_HOST inside the container."
  value       = module.database.private_ip
}

output "database_password_secret_id" {
  description = "Secret Manager secret holding the database password."
  value       = module.database.password_secret_id
}

output "photo_bucket_name" {
  description = "GCS bucket holding task photos. Reaches the backend as GCS_BUCKET."
  value       = module.storage.bucket_name
}

output "backend_runtime_service_account" {
  description = "Service account the Cloud Run service and jobs run as."
  value       = module.iam.runtime_email
}

output "deployer_service_account" {
  description = "Service account for CI."
  value       = module.iam.deployer_email
}

output "deployer_service_account_key" {
  description = "Base64 JSON key for the deployer, only when create_deployer_key is true."
  value       = module.iam.deployer_key
  sensitive   = true
}

output "vercel_project_name" {
  description = "Vercel project the SPA is served from. Not managed here."
  value       = var.vercel_project_name
}

output "frontend_url" {
  description = "Vercel's production alias for the project."
  value       = "https://${var.vercel_project_name}.vercel.app"
}

output "frontend_allowed_origins" {
  description = "Origins written into the backend's ECOTRACK_CORS_ALLOWED_ORIGINS."
  value       = local.frontend_origins
}
