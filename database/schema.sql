DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Bill;
DROP TABLE IF EXISTS User_Property;
DROP TABLE IF EXISTS Property;
DROP TABLE IF EXISTS PropertyManager;
DROP TABLE IF EXISTS User;

USE DB;



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
    property_image VARCHAR(255) NULL,
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