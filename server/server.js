// server.js - Main server file for Library Management System
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'library_management_system_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, solution: result[0].solution });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Import route files
const booksRoutes = require('./routes/books');
const membersRoutes = require('./routes/members');
const loansRoutes = require('./routes/loans');
const authorsRoutes = require('./routes/authors');
const categoriesRoutes = require('./routes/categories');
const publishersRoutes = require('./routes/publishers');
const queriesRoutes = require('./routes/queries'); // For complex predefined queries

// Use routes
app.use('/api/books', booksRoutes(db));
app.use('/api/members', membersRoutes(db));
app.use('/api/loans', loansRoutes(db));
app.use('/api/authors', authorsRoutes(db));
app.use('/api/categories', categoriesRoutes(db));
app.use('/api/publishers', publishersRoutes(db));
app.use('/api/queries', queriesRoutes(db)); // Complex queries

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;