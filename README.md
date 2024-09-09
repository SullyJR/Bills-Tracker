# COSC349 Assignment 1: Virtualisation - Flat Bills Tracker <!-- omit in toc -->

A web application for managing bills and payments in shared living situations, built with a focus on portable deployment through virtualization. This project allows tenants to track their bills and property managers to oversee multiple properties and assign bills to tenants. By leveraging containerization technology, the Flat Bills Tracker ensures consistent performance across various computing environments. 

Developed by Anthony Dong (2169260) and Callum Sullivan.

## Table of Contents <!-- omit in toc -->
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
  - [For Tenants:](#for-tenants)
  - [For Property Managers:](#for-property-managers)
- [Development](#development)
  - [Database Modifications:](#database-modifications)
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
- Database: MySQL
- Containerization: Docker and Docker Compose
- Version Control: Git

## Project Structure

The project is organized into three main components:

1. Tenant Service: Handles tenant-related functionalities
2. Manager Service: Manages property manager functionalities
3. Database Service: MySQL database for data storage

Each service runs in its own Docker container, ensuring isolation and easy deployment. The tenant and manager services communicate with each other via the database service. Both services access the database using Express, with API endpoints handling the HTTP requests.

## Setup and Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd rental
   ```

2. Ensure Docker and Docker Compose are installed on your system.

3. Build and start the containers:
   ```
   docker-compose up --build
   ```
   Or on some systems:
   ```
   docker compose up build
   ```

4. The application will be available at:
   - Tenant Portal: http://localhost:3000
   - Manager Portal: http://localhost:3001

## Usage

### For Tenants:
1. Navigate to http://localhost:3000
2. Register a new account or log in
3. Select your property
4. Add and manage your bills

### For Property Managers:
1. Navigate to http://localhost:3001
2. Register a new account or log in
3. Add properties and manage tenants
4. Assign bills to properties or individual tenants

## Development

To modify the application:

1. Make changes to the relevant files in the `tenant` or `manager` directories.
2. Rebuild the Docker containers:
   ```
   docker-compose down -v
   docker-compose up --build
   ```
    Or on some systems:

    ```
    docker compose down -v
    docker compose up --build
    ```
    
    If a user wishes to maintain the state of the system:
    ```
    docker-compose down
    docker-compose up --build
    ```

### Database Modifications:
- Update the schema in `schema.sql`
- Modify the `data.sql` file for any changes to the initial test data
- Run the following command from a terminal in the project directory to access the database for debugging purposes:
  ```
  docker-compose exec db mysql -u root -p
  ```
    Enter the password `rootpassword` when prompted.

- To view the database tables, run:
- `use DB;` to select the database
- `show tables;` to list all tables
- `SELECT * FROM <table-name>` to list the details of the table-name

## Contributing

We welcome contributions to improve the Flat Bills Tracker. Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

---
## Contact

For any questions or support, please contact the project maintainers:
- [Anthony Dong](https://github.com/anthonyzhdong)
- [Callum Sullivan](https://github.com/SullyJR)
