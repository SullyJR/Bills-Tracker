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

# EC2 Instances
resource "aws_instance" "tenant_vm" {
  ami           = "ami-010e83f579f15bba0"  # Ubuntu AMI, you may need to change this
  instance_type = "t2.micro"
  key_name      = "cosc349-2024"  # This is typically the key name in AWS Academy

  vpc_security_group_ids = [aws_security_group.allow_web_and_ssh.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y nodejs npm mysql-client
              git clone https://github.com/SullyJR/Bills-Tracker
              cd tenant
              npm install
              npm run start
              EOF

  tags = {
    Name = "TenantVM"
  }
}

resource "aws_instance" "manager_vm" {
  ami           = "ami-010e83f579f15bba0"  # Ubuntu AMI, you may need to change this
  instance_type = "t2.micro"
  key_name      = "cosc349-2024"

  vpc_security_group_ids = [aws_security_group.allow_web_and_ssh.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y nodejs npm mysql-client
              git clone https://github.com/SullyJR/Bills-Tracker
              cd manager
              npm install
              npm run start
              EOF

  tags = {
    Name = "AdminVM"
  }
}

# Outputs
output "tenant_vm_public_ip" {
  value = aws_instance.tenant_vm.public_ip
}

output "manager_vm_public_ip" {
  value = aws_instance.manager_vm.public_ip
}