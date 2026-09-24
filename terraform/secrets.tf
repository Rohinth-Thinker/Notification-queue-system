
resource "aws_secretsmanager_secret" "postgres_credentials" {
  name = "${var.project_name}/postgres-credentials"

  description = "PostgreSQL credentials for notification queue"

  tags = {
    Name = "${var.project_name}-postgres-credentials"
  }
}