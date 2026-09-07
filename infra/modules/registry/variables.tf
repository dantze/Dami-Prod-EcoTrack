variable "prefix" {
  type = string
}

variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "repository_id" {
  type = string
}

variable "image_name" {
  type = string
}

variable "keep_recent_count" {
  type = number
}

variable "labels" {
  type = map(string)
}

variable "description" {
  type = string
}
