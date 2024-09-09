const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use(session({
    name: 'manager-session',
    secret: 'COSC349A1Manager',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.managerId) {
        next();
    } else {
        res.redirect('/');
    }
};


// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'DB'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to database');
});


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Login',
        welcomeMessage: 'Welcome to Manager Portal',
        loginAction: '/login',
        signInButtonText: 'Sign In',
        errorMessage: null
    });

});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

app.post('/register', (req, res) => {
    const { first_name, last_name, email, password, phone_number, company } = req.body;

    const query = 'INSERT INTO PropertyManager (first_name, last_name, email, manager_password, phone_number, company) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [first_name, last_name, email, password, phone_number, company], (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            return res.render('register', {
                errorMessage: 'Registration failed. Please try again.'
            });
        } else {
            console.log('Registration successful:', result);
            res.redirect('/');
        }
    });
});


app.post('/add-property', isAuthenticated, (req, res) => {
    const { property_address, rental_price, bedrooms, bathrooms } = req.body;
    const managerId = req.session.managerId;

    const query = 'INSERT INTO Property (property_address, rental_price, bedrooms, bathrooms, manager_id) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [property_address, rental_price, bedrooms, bathrooms, managerId], (err, result) => {
        if (err) {
            console.error('Error adding property:', err);
            // You might want to send an error response to the client here
            return res.status(500).send('Error adding property');
        }
        // Redirect back to dashboard after adding property
        res.redirect('/dashboard');
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM PropertyManager WHERE email = ? AND manager_password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.render('index', {
                title: 'Login',
                welcomeMessage: 'Welcome to Rental',
                loginAction: '/login',
                signInButtonText: 'Sign In',
                errorMessage: 'An error occurred. Please try again.'
            });
        }

        if (results.length > 0) {
            // User found, render success page
            req.session.managerId = results[0].manager_id;
            res.redirect('/dashboard');
        } else {
            // User not found or incorrect password
            res.render('index', {
                title: 'Login',
                welcomeMessage: 'Welcome to Rental',
                loginAction: '/login',
                signInButtonText: 'Sign In',
                errorMessage: 'Invalid email or password.'
            });
        }
    });
});

app.post('/add-property', isAuthenticated, (req, res) => {
    const { property_address, rental_price, bedrooms, bathrooms } = req.body;
    const managerId = req.session.managerId;

    const query = 'INSERT INTO Property (property_address, rental_price, bedrooms, bathrooms, manager_id) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [property_address, rental_price, bedrooms, bathrooms, managerId], (err, result) => {
        if (err) {
            console.error('Error adding property:', err);
            // Handle error (you might want to send an error response)
        }
        // Redirect back to dashboard after adding property
        res.redirect('/dashboard');
    });
});

app.post('/update-profile', isAuthenticated, (req, res) => {
    const { first_name, last_name, email, phone_number, company } = req.body;
    const managerId = req.session.managerId;

    const updateQuery = `
        UPDATE PropertyManager 
        SET first_name = ?, last_name = ?, email = ?, phone_number = ?, company = ?
        WHERE manager_id = ?
    `;

    db.query(updateQuery, [first_name, last_name, email, phone_number, company, managerId], (err, result) => {
        if (err) {
            console.error('Error updating manager profile:', err);
            return res.status(500).json({ success: false, message: 'Error updating profile' });
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

app.post('/add-bill', isAuthenticated, (req, res) => {
    const { propertyId, billType, amount, dueDate, userId } = req.body;
    
    if (userId === 'all') {
        // Add bill for all tenants of the property
        const getUsersQuery = 'SELECT user_id FROM User WHERE property_id = ?';
        db.query(getUsersQuery, [propertyId], (err, users) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ success: false, message: 'Error adding bill' });
            }
            
            const insertBillQuery = 'INSERT INTO Bill (bill_type, amount, due_date, paid, user_id, property_id) VALUES ?';
            const values = users.map(user => [billType, amount, dueDate, false, user.user_id, propertyId]);
            
            db.query(insertBillQuery, [values], (err, result) => {
                if (err) {
                    console.error('Error adding bills:', err);
                    return res.status(500).json({ success: false, message: 'Error adding bills' });
                }
                res.json({ success: true, message: 'Bills added successfully' });
            });
        });
    } else {
        // Add bill for a specific tenant
        const insertBillQuery = 'INSERT INTO Bill (bill_type, amount, due_date, paid, user_id, property_id) VALUES (?, ?, ?, false, ?, ?)';
        db.query(insertBillQuery, [billType, amount, dueDate, userId, propertyId], (err, result) => {
            if (err) {
                console.error('Error adding bill:', err);
                return res.status(500).json({ success: false, message: 'Error adding bill' });
            }
            res.json({ success: true, message: 'Bill added successfully' });
        });
    }
});


app.get('/dashboard', isAuthenticated, (req, res) => {
    const managerId = req.session.managerId;

    // Query to get manager details
    const managerQuery = 'SELECT * FROM PropertyManager WHERE manager_id = ?';

    // Query to get properties managed by this manager
    const propertiesQuery = 'SELECT * FROM Property WHERE manager_id = ?';

    // Query to get users for each property
    const usersQuery = 'SELECT u.* FROM User u JOIN Property p ON u.property_id = p.property_id WHERE p.manager_id = ?';

    db.query(managerQuery, [managerId], (err, managerResults) => {
        if (err) {
            console.error('Error fetching manager data:', err);
            return res.status(500).send('An error occurred');
        }

        const manager = managerResults[0];

        db.query(propertiesQuery, [managerId], (err, propertiesResults) => {
            if (err) {
                console.error('Error fetching properties data:', err);
                return res.status(500).send('An error occurred');
            }

            db.query(usersQuery, [managerId], (err, usersResults) => {
                if (err) {
                    console.error('Error fetching users data:', err);
                    return res.status(500).send('An error occurred');
                }

                // Organize users by property
                const properties = propertiesResults.map(property => {
                    property.users = usersResults.filter(user => user.property_id === property.property_id);
                    return property;
                });

                res.render('dashboard', { manager, properties });
            });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

PORT = 3001;

app.listen(PORT, () => {
    console.log(`Manager server is running at http://localhost:${PORT}`);
});