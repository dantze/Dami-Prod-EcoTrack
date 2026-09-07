output "project_id" {
  value = vercel_project.web.id
}

output "project_name" {
  value = vercel_project.web.name
}

output "url" {
  value = "https://${vercel_project.web.name}.vercel.app"
}
