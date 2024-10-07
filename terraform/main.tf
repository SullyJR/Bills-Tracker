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

user_data = <<-EOF
              #!/bin/bash
              exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
              echo "Starting user data script execution"

              sudo apt-get update
              sudo apt-get install -y nodejs npm mysql-client
              echo "Packages installed"

              sudo git clone https://github.com/SullyJR/Bills-Tracker /home/ubuntu/Bills-Tracker
              echo "Repository cloned"

              echo "DB_HOST=${replace(aws_db_instance.mysql.endpoint, ":3306", "")}" >> /home/ubuntu/Bills-Tracker/tenant/.env
              echo "DB_USER=admin" >> /home/ubuntu/Bills-Tracker/tenant/.env
              echo "DB_PASSWORD=Password123" >> /home/ubuntu/Bills-Tracker/tenant/.env
              echo "DB_NAME=myapp" >> /home/ubuntu/Bills-Tracker/tenant/.env
              echo "Environment variables set"

              cd /home/ubuntu/Bills-Tracker/tenant
              sudo npm install
              echo "npm install completed"

              sudo npm run start &
              echo "npm start initiated"

              echo "User data script completed"
              EOF

  tags = {
    Name = "TenantVM"
  }
}

resource "aws_instance" "manager_vm" {
  ami           = "ami-010e83f579f15bba0" 
  instance_type = "t2.micro"
  key_name      = "cosc349-2024"

  vpc_security_group_ids = [aws_security_group.allow_web_and_ssh.id, aws_security_group.allow_express_backend.id]

  user_data = <<-EOF
                #!/bin/bash
                exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
                echo "Starting user data script execution"

                sudo apt-get update
                sudo apt-get install -y nodejs npm mysql-client
                echo "Packages installed"

                sudo git clone https://github.com/SullyJR/Bills-Tracker /home/ubuntu/Bills-Tracker
                echo "Repository cloned"

                # Wait for RDS to be ready
                while ! mysql -h ${replace(aws_db_instance.mysql.endpoint, ":3306", "")} -u admin -p'Password123' -e "SELECT 1" >/dev/null 2>&1; do
                  echo "Waiting for RDS to be ready..."
                  sleep 10
                done

                # Run SQL scripts
                mysql -h ${replace(aws_db_instance.mysql.endpoint, ":3306", "")} -u admin -p'Password123' myapp < /home/ubuntu/Bills-Tracker/database/schema.sql
                echo "SQL script executed"

                echo "DB_HOST=${replace(aws_db_instance.mysql.endpoint, ":3306", "")}" >> /home/ubuntu/Bills-Tracker/manager/.env
                echo "DB_USER=admin" >> /home/ubuntu/Bills-Tracker/manager/.env
                echo "DB_PASSWORD=Password123" >> /home/ubuntu/Bills-Tracker/manager/.env
                echo "DB_NAME=myapp" >> /home/ubuntu/Bills-Tracker/manager/.env
                echo "Environment variables set"

                cd /home/ubuntu/Bills-Tracker/manager
                sudo npm install
                echo "npm install completed"

                sudo npm run start &
                echo "npm start initiated"

                echo "User data script completed"
                EOF

  tags = {
    Name = "AdminVM"
  }
}

# RDS Instance
resource "aws_db_instance" "mysql" {
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  identifier           = "mydb"
  db_name              = "myapp"
  username             = "admin"
  password             = "Password123" 
  skip_final_snapshot  = true
  publicly_accessible  = true 

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