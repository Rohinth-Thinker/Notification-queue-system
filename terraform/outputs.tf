output "vpc_id" {
  description = "ID of the notification VPC"
  value       = aws_vpc.main.id
}
output "public_subnet_ids" {
  description = "Public subnet IDs"
  value = [
    aws_subnet.public_a.id,
    aws_subnet.public_b.id
  ]
}
output "private_subnet_ids" {
  description = "Private subnet IDs"
  value = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]
}
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
output "api_task_definition" {
  description = "API task definition ARN"
  value       = aws_ecs_task_definition.api.arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "api_target_group_arn" {
  description = "API target group ARN"
  value       = aws_lb_target_group.api.arn
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.address
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "postgres_secret_arn" {
  description = "PostgreSQL Secrets Manager ARN"
  value       = aws_secretsmanager_secret.postgres_credentials.arn
}