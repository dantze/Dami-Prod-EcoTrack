terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.0"
    }
  }
}

resource "vercel_project" "web" {
  name             = var.project_name
  framework        = "vite"
  root_directory   = var.root_directory
  install_command  = var.install_command
  build_command    = var.build_command
  output_directory = var.output_directory
  ignore_command   = "git diff --quiet HEAD^ HEAD -- ${var.root_directory} shared"

  git_repository = var.git_repository != "" ? {
    type              = "github"
    repo              = var.git_repository
    production_branch = var.production_branch
  } : null
}

resource "vercel_project_environment_variable" "api_base_url" {
  project_id = vercel_project.web.id
  key        = "VITE_API_BASE_URL"
  value      = var.api_base_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "data_mode" {
  project_id = vercel_project.web.id
  key        = "VITE_DATA_MODE"
  value      = var.data_mode
  target     = ["production", "preview", "development"]
}

resource "vercel_project_domain" "custom" {
  for_each = toset(var.custom_domains)

  project_id = vercel_project.web.id
  domain     = each.value
}
