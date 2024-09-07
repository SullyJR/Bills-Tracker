USE DB;
-- Insert test data into PropertyManager table
INSERT INTO PropertyManager (first_name, last_name, email, manager_password, phone_number, company) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashed_password_1', '555-0101', 'ABC Property Management'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashed_password_2', '555-0202', 'XYZ Realty');

-- Insert test data into Property table
INSERT INTO Property (property_address, rental_price, bedrooms, bathrooms, manager_id) VALUES
('123 Main St, Cityville', 1500.00, 3, 2, 1),
('456 Elm St, Townsburg', 1200.00, 2, 1, 1),
('789 Oak Ave, Villageton', 1800.00, 4, 3, 2);

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