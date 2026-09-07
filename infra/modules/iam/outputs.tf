output "runtime_email" {
  value = google_service_account.runtime.email
}

output "runtime_name" {
  value = google_service_account.runtime.name
}

output "deployer_email" {
  value = google_service_account.deployer.email
}

output "deployer_key" {
  value     = var.create_deployer_key ? google_service_account_key.deployer[0].private_key : null
  sensitive = true
}

output "scheduler_email" {
  value = google_service_account.scheduler.email
}
