output "service_name" {
  value = google_cloud_run_v2_service.backend.name
}

output "service_uri" {
  value = google_cloud_run_v2_service.backend.uri
}

output "job_names" {
  value = sort([for job in google_cloud_run_v2_job.nightly : job.name])
}
