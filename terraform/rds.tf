resource "aws_db_subnet_group" "postgres" {
  name = "${var.project_name}-postgres"

  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]

  tags = {
    Name = "${var.project_name}-postgres"
  }
}

resource "aws_db_instance" "postgres" {
  identifier = "${var.project_name}-postgres"

  engine         = "postgres"
  engine_version = "17"

  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  storage_type        = "gp3"
  publicly_accessible = false
  skip_final_snapshot = true
  deletion_protection = false

  db_name             = var.postgres_db
  username            = var.postgres_user
  password_wo         = var.postgres_password
  password_wo_version = 1

  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.database.id]

  backup_retention_period = 0

  tags = {
    Name = "${var.project_name}-postgres"
  }
}