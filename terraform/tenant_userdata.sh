#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
echo "Starting user data script execution"

sudo apt-get update
sudo apt-get install -y nodejs npm mysql-client
echo "Packages installed"

sudo git clone https://github.com/SullyJR/Bills-Tracker /home/ubuntu/Bills-Tracker
echo "Repository cloned"

echo "DB_HOST=${db_host}" >> /home/ubuntu/Bills-Tracker/tenant/.env
echo "DB_USER=${db_user}" >> /home/ubuntu/Bills-Tracker/tenant/.env
echo "DB_PASSWORD=${db_password}" >> /home/ubuntu/Bills-Tracker/tenant/.env
echo "DB_NAME=${db_name}" >> /home/ubuntu/Bills-Tracker/tenant/.env
echo "Environment variables set"

cd /home/ubuntu/Bills-Tracker/tenant
sudo npm install
echo "npm install completed"

sudo npm run start &
echo "npm start initiated"

echo "User data script completed"