DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Bill;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Property;
DROP TABLE IF EXISTS PropertyManager;

CREATE TABLE PropertyManager (
    manager_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    manager_password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL -- extension as its own label?
);

CREATE TABLE Property (
    property_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    property_address VARCHAR(255) NOT NULL,
    rental_price DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    manager_id INT NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES PropertyManager(manager_id)
);

CREATE TABLE User (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    property_id INT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(property_id)
); 

CREATE TABLE Bill (
    bill_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    bill_type VARCHAR(255) NOT NULL, -- primary key -> rent, utilities etc.?
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN NOT NULL,
    paid_date DATE,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (property_id) REFERENCES Property(property_id)
);


-- Insert test data into PropertyManager table
INSERT INTO PropertyManager (first_name, last_name, email, manager_password, phone_number, company) VALUES
('John', 'Doe', 'test@gmail.com', 'test', '555-0101', 'ABC Property Management'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashed_password_2', '555-0202', 'XYZ Realty');

-- Insert test data into Property table
INSERT INTO Property (property_address, rental_price, bedrooms, bathrooms, manager_id) VALUES
('123 Main St, Cityville', 1500.00, 3, 2, 1),
('456 Elm St, Townsburg', 1500.00, 3, 2, 1),
('789 Oak Ave, Villageton', 2000.00, 4, 3, 2);

-- Insert test data into User table
INSERT INTO User (first_name, last_name, email, user_password, phone_number, property_id) VALUES
('Alice', 'Johnson', 'test@gmail.com', 'test', '555-1111', 1),
('Bob', 'Williams', 'bob.w@example.com', 'hashed_password_4', '555-2222', 1),
('Charlie', 'Brown', 'charlie.b@example.com', 'hashed_password_5', '555-3333', 2),
('David', 'Miller', 'david.m@example.com', 'hashed_password_6', '555-4444', 3);

-- Insert test data into Bill table
INSERT INTO Bill (bill_type, amount, due_date, paid, paid_date, user_id, property_id) VALUES
('Rent', 1500.00, '2023-09-01', TRUE, '2023-09-01', 1, 1),
('Utilities', 100.00, '2023-09-05', TRUE, '2023-09-03', 1, 1),
('Rent', 1500.00, '2023-09-01', TRUE, '2023-09-01', 2, 1),
('Rent', 1200.00, '2023-09-01', FALSE, NULL, 3, 2),
('Rent', 1800.00, '2023-09-01', TRUE, '2023-09-01', 4, 3),
('Utilities', 150.00, '2023-09-05', FALSE, NULL, 4, 3);
