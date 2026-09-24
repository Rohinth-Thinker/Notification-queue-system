
resource "aws_elasticache_subnet_group" "redis" {
  name = "${var.project_name}-redis"

  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project_name}-redis"
  description          = "Redis for notification queue"

  engine             = "redis"
  node_type          = "cache.t3.micro"
  num_cache_clusters = 1

  port = 6379

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  automatic_failover_enabled = false

  tags = {
    Name = "${var.project_name}-redis"
  }
}