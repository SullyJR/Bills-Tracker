const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
//
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

// Session middleware
app.use(session({
    name: 'tenant-session',
    secret: 'cosc349A1',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
};

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
        welcomeMessage: 'Welcome to Tenant Portal',
        loginAction: '/login',
        signInButtonText: 'Sign In',
        errorMessage: null 
    });

});

app.get('/register', (req, res) => {
    const query = 'SELECT * FROM Property';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching properties:', err);
            return res.render('register', { errorMessage: 'Failed to load properties. Please try again.', properties: [] });
        }
        res.render('register', { errorMessage: null, properties: results });
    });
});
// Updated route to display available properties
app.get('/available-properties', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    
    // First, get the user's current property_id
    const userQuery = 'SELECT property_id FROM User WHERE user_id = ?';
    
    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('An error occurred');
        }

        const userPropertyId = userResults[0] ? userResults[0].property_id : null;

        // Now, query for available properties, excluding the user's current property
        const propertiesQuery = `
            SELECT 
                p.*, 
                pm.first_name AS landlord_first_name,
                pm.last_name AS landlord_last_name,
                COALESCE(u.tenant_count, 0) AS tenant_count
            FROM 
                Property p
            LEFT JOIN PropertyManager pm ON p.manager_id = pm.manager_id
            LEFT JOIN (
                SELECT 
                    property_id, 
                    COUNT(*) AS tenant_count
                FROM 
                    User
                WHERE 
                    property_id IS NOT NULL
                GROUP BY 
                    property_id
            ) u ON p.property_id = u.property_id
            WHERE 
                (p.bedrooms > COALESCE(u.tenant_count, 0) OR u.tenant_count IS NULL)
                AND p.property_id != IFNULL(?, -1)  -- Exclude user's current property
        `;
        
        db.query(propertiesQuery, [userPropertyId], (err, propertiesResults) => {
            if (err) {
                console.error('Error fetching available properties:', err);
                return res.status(500).send('An error occurred');
            }
            res.render('available-properties', { properties: propertiesResults });
        });
    });
});

app.post('/update-profile', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { first_name, last_name, email, phone_number } = req.body;

    // Validate phone number format
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(phone_number)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const updateQuery = `
        UPDATE User 
        SET first_name = ?, last_name = ?, email = ?, phone_number = ?
        WHERE user_id = ?
    `;

    db.query(updateQuery, [first_name, last_name, email, phone_number, userId], (err, result) => {
        if (err) {
            console.error('Error updating user profile:', err);
            return res.status(500).json({ success: false, message: 'Error updating profile' });
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

app.post('/rent-property', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const propertyId = req.body.property_id;

    // First, check if the property is still available
    const checkAvailabilityQuery = `
        SELECT 
            p.bedrooms, 
            COALESCE(u.tenant_count, 0) AS tenant_count
        FROM 
            Property p
        LEFT JOIN (
            SELECT 
                property_id, 
                COUNT(*) AS tenant_count
            FROM 
                User
            WHERE 
                property_id = ?
            GROUP BY 
                property_id
        ) u ON p.property_id = u.property_id
        WHERE 
            p.property_id = ?
    `;

    db.query(checkAvailabilityQuery, [propertyId, propertyId], (err, results) => {
        if (err) {
            console.error('Error checking property availability:', err);
            return res.status(500).send('An error occurred');
        }

        if (results.length === 0) {
            return res.status(404).send('Property not found');
        }

        const { bedrooms, tenant_count } = results[0];

        if (tenant_count >= bedrooms) {
            return res.status(400).send('This property is no longer available');
        }

        // If the property is available, proceed with the rental
        const rentQuery = 'UPDATE User SET property_id = ? WHERE user_id = ?';
        
        db.query(rentQuery, [propertyId, userId], (err, result) => {
            if (err) {
                console.error('Error renting property:', err);
                return res.status(500).send('An error occurred');
            }
            res.redirect('/dashboard');
        });
    });
});



app.post('/register', (req, res) => {
    const { first_name, last_name, email, password, phone_number, property_id } = req.body;

    // If property_id is an empty string, set it to NULL
    const propertyIdValue = property_id === '' ? null : property_id;

    const query = 'INSERT INTO User (first_name, last_name, email, user_password, phone_number, property_id) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [first_name, last_name, email, password, phone_number, propertyIdValue], (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            return res.render('register', {
                errorMessage: 'Registration failed. Please try again.',
                properties: [] // You might want to fetch properties again here
            });
        } else {
            console.log('Registration successful:', result);
            res.redirect('/');
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM User WHERE email = ? AND user_password = ?';
    
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            req.session.error = 'An error occurred. Please try again.';
            return res.redirect('/');
        }
        
        if (results.length > 0) {
            req.session.userId = results[0].user_id;
            res.redirect('/dashboard');
        } else {
            req.session.error = 'Invalid email or password.';
            res.render('index', {
                title: 'Login',
                welcomeMessage: 'Welcome to Tenant Portal',
                loginAction: '/login',
                signInButtonText: 'Sign In',
                errorMessage: req.session.error
            });
        }
    });
});

app.post('/add-bill', isAuthenticated, (req, res) => {
    const { user_id, property_id, bill_type, amount, due_date} = req.body;
    const query = 'INSERT INTO Bill (bill_type, amount, due_date, paid, user_id, property_id) VALUES (?, ?, ?, false, ?, ?)';

    db.query(query, [bill_type, amount, due_date, user_id, property_id], (err, result) => {
        if (err) {
            console.error('Error adding bill:', err);
            return res.status(500).send('An error occurred while adding the bill');
        }
        res.redirect('/dashboard');
    });
});


app.post('/pay-bill', isAuthenticated, (req, res) => {
    const { bill_id } = req.body;
    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const query = 'UPDATE Bill SET paid = true, paid_date = ? WHERE bill_id = ?';

    db.query(query, [currentDate, bill_id], (err, result) => {
        if (err) {
            console.error('Error paying bill:', err);
            return res.status(500).send('An error occurred while paying the bill');
        }
        res.redirect('/dashboard');
    });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const userQuery = `
    SELECT User.*, 
           Property.property_address, 
           Property.rental_price,
           Property.bedrooms,
           Property.bathrooms,
           PropertyManager.first_name AS landlord_first_name,
           PropertyManager.last_name AS landlord_last_name,
           PropertyManager.company AS landlord_company,
           PropertyManager.email AS landlord_email,
           PropertyManager.phone_number AS landlord_phone
    FROM User 
    LEFT JOIN Property ON User.property_id = Property.property_id 
    LEFT JOIN PropertyManager ON Property.manager_id = PropertyManager.manager_id
    WHERE User.user_id = ?
`;
    const billsQuery = 'SELECT * FROM Bill WHERE user_id = ? ORDER BY due_date DESC';

    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('An error occurred');
        }

        const user = userResults[0];

        db.query(billsQuery, [userId], (err, billsResults) => {
            if (err) {
                console.error('Error fetching bills data:', err);
                return res.status(500).send('An error occurred');
            }

            res.render('dashboard', { user, bills: billsResults });
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


app.listen(3000, '0.0.0.0', () => {
    console.log('Server listening on port 80');
});