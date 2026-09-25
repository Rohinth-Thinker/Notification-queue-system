resource "aws_secretsmanager_secret" "postgres_credentials" {
  name        = "${var.project_name}/postgres-credentials"
  description = "PostgreSQL credentials for notification queue"

  tags = {
    Name = "${var.project_name}-postgres-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "postgres_credentials" {
  secret_id = aws_secretsmanager_secret.postgres_credentials.id

  secret_string = jsonencode({
    username = var.postgres_user
    password = var.postgres_password
  })
}