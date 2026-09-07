variable "project_name" {
  type = string
}

variable "root_directory" {
  type = string
}

variable "install_command" {
  type = string
}

variable "build_command" {
  type = string
}

variable "output_directory" {
  type = string
}

variable "git_repository" {
  type = string
}

variable "production_branch" {
  type = string
}

variable "api_base_url" {
  type = string
}

variable "data_mode" {
  type = string
}

variable "custom_domains" {
  type = list(string)
}
