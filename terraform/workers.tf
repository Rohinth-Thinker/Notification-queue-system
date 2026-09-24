resource "aws_ecs_task_definition" "notification_worker" {
  family                   = "notification-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"

  execution_role_arn = data.aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "notification-worker"
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/notification-worker:${var.image_tag}"
      essential = true

      command = [
        "node",
        "src/queue/notificationWorker.js"
      ]

      environment = [
        {
          name  = "REDIS_HOST"
          value = var.redis_host
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        },
        {
          name  = "POSTGRES_HOST"
          value = var.postgres_host
        },
        {
          name  = "POSTGRES_PORT"
          value = var.postgres_port
        },
        {
          name  = "POSTGRES_DB"
          value = var.postgres_db
        },
        {
          name  = "POSTGRES_USER"
          value = var.postgres_user
        }
      ]

      secrets = [
        {
          name      = "POSTGRES_PASSWORD"
          valueFrom = aws_secretsmanager_secret.postgres_credentials.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/notification-worker"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "notification-worker"
  }
}


resource "aws_ecs_task_definition" "outbox_worker" {
  family                   = "notification-outbox-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"

  execution_role_arn = data.aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "notification-outbox-worker"
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/notification-outbox-worker:${var.image_tag}"
      essential = true

      command = [
        "node",
        "src/workers/outboxWorker.js"
      ]

      environment = [
        {
          name  = "REDIS_HOST"
          value = var.redis_host
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        },
        {
          name  = "POSTGRES_HOST"
          value = var.postgres_host
        },
        {
          name  = "POSTGRES_PORT"
          value = var.postgres_port
        },
        {
          name  = "POSTGRES_DB"
          value = var.postgres_db
        },
        {
          name  = "POSTGRES_USER"
          value = var.postgres_user
        }
      ]

      secrets = [
        {
          name      = "POSTGRES_PASSWORD"
          valueFrom = aws_secretsmanager_secret.postgres_credentials.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/notification-outbox-worker"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "notification-outbox-worker"
  }
}