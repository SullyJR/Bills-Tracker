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

// app.use(session({
//     secret: 'your_session_secret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true } // set to true if using https
// }));


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
        //registerButtonText: 'Register New Account',
        errorMessage: null // Assuming you're using connect-flash for error messages
      });

});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

// app.get('/login', (req, res) => {
//     res.render('login', {
//       title: 'Login',
//       welcomeMessage: 'Welcome to Rental',
//       loginAction: '/login',
//       signInButtonText: 'Sign In',
//       registerButtonText: 'Register New Account',
//       errorMessage: req.flash('error') // Assuming you're using connect-flash for error messages
//     });
//   });


app.post('/register', (req, res) => {
    const { first_name, last_name, email, password, phone_number, property_id } = req.body;
    
    const query = 'INSERT INTO User (first_name, last_name, email, user_password, phone_number, property_id) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [first_name, last_name, email, password, phone_number, property_id], (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            return res.render('register', { errorMessage: 'Registration failed. Please try again.' });
        }
        
        console.log('Registration successful:', result);
        res.render('success', { 
            title: 'Registration Successful',
            message: 'You have successfully created an account!'
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM User WHERE email = ? AND user_password = ?';
    
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
            // User found, redirect to dashboard
            res.redirect(`/dashboard/${results[0].user_id}`);
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

app.get('/dashboard/:userId', (req, res) => {
    const userId = req.params.userId;
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


PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});