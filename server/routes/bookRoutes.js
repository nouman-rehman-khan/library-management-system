// bookRoutes
const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

// GET /api/books - Get all books
router.get('/', bookController.getAllBooks);

// GET /api/books/popular - Get popular books
router.get('/popular', bookController.getPopularBooks);

// GET /api/books/search - Search books
router.get('/search', bookController.searchBooks);

// GET /api/books/category/:categoryId - Get books by category
router.get('/category/:categoryId', bookController.getBooksByCategory);

// GET /api/books/author/:authorId - Get books by author
router.get('/author/:authorId', bookController.getBooksByAuthor);

// GET /api/books/:id - Get a single book by ID
router.get('/:id', bookController.getBookById);

// POST /api/books - Create a new book
router.post('/', bookController.createBook);

// PUT /api/books/:id - Update a book
router.put('/:id', bookController.updateBook);

// DELETE /api/books/:id - Delete a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;