require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import the database connection

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    const [result] = await db.query('SELECT 1');
    console.log('Database connection successful!', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const authorRoutes = require('./routes/authorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const loanRoutes = require('./routes/loanRoutes');

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/loans', loanRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Library Management System API is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server after testing database connection
const startServer = async () => {
  const isDbConnected = await testDatabaseConnection();
  
  if (!isDbConnected) {
    console.error('Failed to start server due to database connection issues');
    process.exit(1); // Exit with error
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
  });
};

startServer();