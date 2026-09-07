variable "prefix" {
  type = string
}

variable "project_id" {
  type = string
}

variable "location" {
  type = string
}

variable "labels" {
  type = map(string)
}

variable "runtime_service_account" {
  type = string
}

variable "force_destroy" {
  type = bool
}
