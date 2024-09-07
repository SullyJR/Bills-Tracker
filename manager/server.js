const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));


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
            res.render('success', {
                title: 'Login Successful',
                message: 'You have successfully logged in manager!'

            });
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

PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});