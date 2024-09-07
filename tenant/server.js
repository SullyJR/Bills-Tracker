const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
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
  res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login', {
      title: 'Login',
      welcomeMessage: 'Welcome to Rental',
      loginAction: '/login',
      signInButtonText: 'Sign In',
      registerButtonText: 'Register New Account',
      errorMessage: req.flash('error') // Assuming you're using connect-flash for error messages
    });
  });

app.listen(3000, () => {
  console.log('Tenant server running on port 3000');
});