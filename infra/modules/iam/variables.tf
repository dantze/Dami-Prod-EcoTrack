variable "prefix" {
  type = string
}

variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "artifact_repository_id" {
  type = string
}

variable "artifact_repository_location" {
  type = string
}

variable "runtime_secret_ids" {
  type = list(string)
}

variable "deployer_extra_roles" {
  type = list(string)
}

variable "create_deployer_key" {
  type = bool
}
