# COSC349 Assignment 2: Cloud Deployment - Flat Bills Tracker <!-- omit in toc! -->

A web application for managing bills and payments in shared living situations, now deployed to the cloud using AWS services and Terraform. This project allows tenants to track their bills and property managers to oversee multiple properties and assign bills to tenants. By leveraging cloud technologies, the Flat Bills Tracker ensures scalability and accessibility.

Developed by Anthony Dong (2169260) and Callum Sullivan (7234749).

# Video Link
[https://youtu.be/v3k8u4zUV0M](https://youtu.be/XUMOO8eKGAQ)

## Table of Contents <!-- omit in toc -->
- [COSC349 Assignment 2: Cloud Deployment - Flat Bills Tracker ](#cosc349-assignment-2-cloud-deployment---flat-bills-tracker-)
- [Video Link](#video-link)
  - [Features](#features)
  - [Technology Stack](#technology-stack)
  - [Project Structure](#project-structure)
  - [Setup and Installation](#setup-and-installation)
  - [Usage](#usage)
    - [For Tenants:](#for-tenants)
    - [For Property Managers:](#for-property-managers)
  - [Development](#development)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## Features
- User authentication through email and password with session management
- Tenant features:
  - Sign up and assign themselves to a property
  - View and edit personal details
  - View property details including the landlords contacts
  - Add and track personal bills
  - View all bills associated with their property
  - View and change to different properties
- Property manager features:
  - Sign up under a company
  - View and edit personal details
  - Add a new property to the database
  - Overview and manage multiple properties
    - Remove tenants from a property
    - Assigning bills to individual tenants or entire properties

## Technology Stack

- Frontend: HTML, CSS, EJS templates
- Backend: Node.js with Express.js
- Database: MySQL (Amazon RDS)
- Cloud Infrastructure: Amazon Web Services (AWS)
- Infrastructure as Code: Terraform
- Serverless Computing: AWS Lambda
- Version Control: Git

## Project Structure

The project is now organized into the following main components:

1. Tenant Service: Deployed on an EC2 instance
2. Manager Service: Deployed on a separate EC2 instance
3. Database Service: MySQL database hosted on Amazon RDS
4. Lambda Function: For periodic database cleanup

All infrastructure is managed using Terraform, ensuring consistent and reproducible deployments.

## Setup and Installation

For new developers joining the project:

1. Ensure you have the following prerequisites installed:
   - Git
   - Node.js and npm
   - Terraform
   - AWS CLI

2. Clone the repository:
   ```
   git clone <repository-url>
   cd Bills-Tracker
   ```

3. Install npm dependencies for both services:
   ```
   cd tenant && npm install
   cd ../manager && npm install
   cd ..
   ```

4. Set up AWS credentials:
   - Ensure you have valid AWS credentials in `~/.aws/credentials`

5. Initialize Terraform:
   ```
   cd terraform
   terraform init
   ```

6. Plan and apply the Terraform configuration:
   ```
   terraform plan
   terraform apply
   ```

7. After successful deployment, Terraform will output the URLs for the tenant and manager portals.

## Usage

### For Tenants:
1. Navigate to the tenant portal URL provided in the Terraform output
2. Register a new account or log in
3. Select your property
4. Add and manage your bills

### For Property Managers:
1. Navigate to the manager portal URL provided in the Terraform output
2. Register a new account or log in
3. Add properties and manage tenants
4. Assign bills to properties or individual tenants

## Development

To modify the application:

1. Make changes to the relevant files in the `tenant` or `manager` directories.
2. If you've made changes to the infrastructure, update the Terraform files accordingly.
3. Apply the changes:
   ```
   terraform plan
   terraform apply
   ```

To access the RDS database for debugging:
1. Ensure you have MySQL client installed locally
2. Use the RDS endpoint provided in the Terraform output:
   ```
   mysql -h <rds-endpoint> -u admin -p
   ```
   Enter the database password when prompted.

3. Once connected, you can run SQL commands to view or modify the database:
   ```
   USE myapp;
   SHOW TABLES;
   SELECT * FROM <table-name>;
   ```

## Contributing

We welcome contributions to improve the Flat Bills Tracker. Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a new Pull Request

Ensure that any infrastructure changes are reflected in the Terraform configuration.

## License

This project is licensed under the MIT License.

---
## Contact

For any questions or support, please contact the project maintainers:
- [Anthony Dong](https://github.com/anthonyzhdong)
- [Callum Sullivan](https://github.com/SullyJR)