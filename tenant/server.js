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

// Session middleware
app.use(session({
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


app.post('/register', (req, res) => {
    const { first_name, last_name, email, password, phone_number, property_id } = req.body;

    const query = 'INSERT INTO User (first_name, last_name, email, user_password, phone_number, property_id) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [first_name, last_name, email, password, phone_number, property_id], (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            // Fetch properties again to re-render the form
            const propertyQuery = 'SELECT * FROM Property';
            db.query(propertyQuery, (propErr, properties) => {
                if (propErr) {
                    console.error('Error fetching properties:', propErr);
                    properties = [];
                }
                return res.render('register', {
                    errorMessage: 'Registration failed. Please try again.',
                    properties: properties
                });
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
    const { user_id, property_id, bill_type, amount, due_date, paid } = req.body;
    const query = 'INSERT INTO Bill (bill_type, amount, due_date, paid, user_id, property_id) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [bill_type, amount, due_date, paid, user_id, property_id], (err, result) => {
        if (err) {
            console.error('Error adding bill:', err);
            return res.status(500).send('An error occurred while adding the bill');
        }
        res.redirect('/dashboard');
    });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const userQuery = 'SELECT * FROM User WHERE user_id = ?';
    const billsQuery = 'SELECT * FROM Bill WHERE user_id = ?';

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

PORT = 3000;

app.listen(PORT, () => {
    console.log(`Tenant server running at http://localhost:${PORT}`);
});