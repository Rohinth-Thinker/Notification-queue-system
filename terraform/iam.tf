data "aws_iam_role" "ecs_execution" {
  name = "ecsTaskExecutionRole"
}

resource "aws_iam_role_policy" "ecs_secrets" {
  name = "${var.project_name}-ecs-secrets"

  role = data.aws_iam_role.ecs_execution.name

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "secretsmanager:GetSecretValue"
        ]

        Resource = aws_secretsmanager_secret.postgres_credentials.arn
      }
    ]
  })
}