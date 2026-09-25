variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "notification"
}
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "redis_host" {
  description = "Redis hostname"
  type        = string
  default     = "notification-redis"
}

variable "redis_port" {
  description = "Redis port"
  type        = string
  default     = "6379"
}

variable "postgres_host" {
  description = "PostgreSQL hostname"
  type        = string
  default     = "notification-postgres"
}

variable "postgres_port" {
  description = "PostgreSQL port"
  type        = string
  default     = "5432"
}

variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
  default     = "notification_db"
}

variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "postgres"
}

variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}