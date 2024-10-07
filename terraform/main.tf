# Provider configuration
provider "aws" {
  region = "us-east-1"
}

# Security Group
resource "aws_security_group" "allow_web_and_ssh" {
  name        = "allow_web_and_ssh"
  description = "Allow inbound web and SSH traffic"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "MySQL"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#Open ports for the two APIs
resource "aws_security_group" "allow_express_backend" {
  name        = "allow_express_backend"
  description = "Allow inbound request to both APIs"

  ingress {
    description = "tenant"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "manager"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instances
resource "aws_instance" "tenant_vm" {
  ami           = "ami-010e83f579f15bba0"
  instance_type = "t2.micro"
  key_name      = "cosc349-2024"

  vpc_security_group_ids = [aws_security_group.allow_web_and_ssh.id, aws_security_group.allow_express_backend.id]

  user_data = templatefile("tenant_userdata.sh", {
    db_host     = replace(aws_db_instance.mysql.endpoint, ":3306", "")
    db_user     = aws_db_instance.mysql.username
    db_password = aws_db_instance.mysql.password
    db_name     = aws_db_instance.mysql.db_name
  })

  tags = {
    Name = "TenantVM"
  }
}

resource "aws_instance" "manager_vm" {
  ami           = "ami-010e83f579f15bba0"
  instance_type = "t2.micro"
  key_name      = "cosc349-2024"

  vpc_security_group_ids = [aws_security_group.allow_web_and_ssh.id, aws_security_group.allow_express_backend.id]

  user_data = templatefile("manager_userdata.sh", {
    db_host     = replace(aws_db_instance.mysql.endpoint, ":3306", "")
    db_user     = aws_db_instance.mysql.username
    db_password = aws_db_instance.mysql.password
    db_name     = aws_db_instance.mysql.db_name
  })

  tags = {
    Name = "AdminVM"
  }
}

# RDS Instance
resource "aws_db_instance" "mysql" {
  engine              = "mysql"
  engine_version      = "8.0"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  identifier          = "mydb"
  db_name             = "myapp"
  username            = "admin"
  password            = "Password123"
  skip_final_snapshot = true
  publicly_accessible = true

  vpc_security_group_ids = [aws_security_group.allow_web_and_ssh.id, aws_security_group.allow_express_backend.id]
}

# Outputs in http link format
output "tenant_vm_public_ip" {
  value = "http://${aws_instance.tenant_vm.public_ip}:3000"
}

output "manager_vm_public_ip" {
  value = "http://${aws_instance.manager_vm.public_ip}:3001"
}

output "rds_endpoint" {
  value = replace(aws_db_instance.mysql.endpoint, ":3306", "")
}
