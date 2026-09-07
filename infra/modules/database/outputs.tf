output "private_ip" {
  value = google_sql_database_instance.postgres.private_ip_address
}

output "db_name" {
  value = google_sql_database.app.name
}

output "db_user" {
  value = google_sql_user.app.name
}

output "password_secret_id" {
  value = google_secret_manager_secret.db_password.secret_id
}

output "password_secret_version_id" {
  value = google_secret_manager_secret_version.db_password.id
}

output "instance_name" {
  value = google_sql_database_instance.postgres.name
}

output "connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}
