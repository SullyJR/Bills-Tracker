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
        welcomeMessage: 'Welcome to Tenant Portal',
        loginAction: '/login',
        signInButtonText: 'Sign In',
        registerButtonText: 'Register New Account',
        errorMessage: null // Assuming you're using connect-flash for error messages
      });

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
                registerButtonText: 'Register New Account',
                errorMessage: 'An error occurred. Please try again.'
            });
        }
        
        if (results.length > 0) {
            // User found, render success page
            res.render('success', { 
                title: 'Login Successful',
                message: 'You have successfully logged in!'

            });
        } else {
            // User not found or incorrect password
            res.render('index', { 
                title: 'Login',
                welcomeMessage: 'Welcome to Rental',
                loginAction: '/login',
                signInButtonText: 'Sign In',
                registerButtonText: 'Register New Account',
                errorMessage: 'Invalid email or password.'
            });
        }
    });
});


app.listen(3000, () => {
  console.log('Tenant server running on port 3000');
});