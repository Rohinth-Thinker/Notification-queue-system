resource "aws_ecs_cluster" "main" {
  name = "notification-queue-cluster"
  tags = {
    Name = "notification-queue-cluster"
  }
}
resource "aws_ecs_task_definition" "api" {
  family                   = "notification-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.ecs_execution.arn
  container_definitions = jsonencode([
    {
      name      = "notification-api"
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/notification-api:${var.image_tag}"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "REDIS_HOST"
          value = aws_elasticache_replication_group.redis.primary_endpoint_address
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        },
        {
          name  = "POSTGRES_HOST"
          value = aws_db_instance.postgres.address
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
          valueFrom = "${aws_secretsmanager_secret.postgres_credentials.arn}:password::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/notification-api"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
  tags = {
    Name = "notification-api"
  }
}
