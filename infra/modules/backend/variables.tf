variable "prefix" {
  type = string
}

variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "service_name" {
  type = string
}

variable "labels" {
  type = map(string)
}

variable "image" {
  type = string
}

variable "container_port" {
  type = number
}

variable "cpu" {
  type = string
}

variable "memory" {
  type = string
}

variable "min_instances" {
  type = number
}

variable "max_instances" {
  type = number
}

variable "allow_public_access" {
  type = bool
}

variable "network_id" {
  type = string
}

variable "subnetwork_id" {
  type = string
}

variable "runtime_service_account" {
  type = string
}

variable "scheduler_service_account" {
  type = string
}

variable "spring_profiles_active" {
  type = string
}

variable "db_host" {
  type = string
}

variable "db_port" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_user" {
  type = string
}

variable "db_password_secret_id" {
  type = string
}

variable "plain_env" {
  type = map(string)
}

variable "secret_env" {
  type      = map(string)
  sensitive = true
}

variable "jobs" {
  type = map(string)
}

variable "scheduler_time_zone" {
  type = string
}
