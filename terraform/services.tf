resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn

  desired_count = 0

  launch_type = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.public_a.id,
      aws_subnet.public_b.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "notification-api"
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.http
  ]
}

resource "aws_ecs_service" "notification_worker" {
  name            = "${var.project_name}-notification-worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.notification_worker.arn

  desired_count = 0

  launch_type = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.public_a.id,
      aws_subnet.public_b.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = true
  }
}

resource "aws_ecs_service" "outbox_worker" {
  name            = "${var.project_name}-outbox-worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.outbox_worker.arn

  desired_count = 0

  launch_type = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.public_a.id,
      aws_subnet.public_b.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = true
  }
}
