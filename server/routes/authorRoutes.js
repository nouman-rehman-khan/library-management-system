// authorRoutes
const express = require('express');
const authorController = require('../controllers/authorController');

const router = express.Router();

// GET /api/authors - Get all authors
router.get('/', authorController.getAllAuthors);

// GET /api/authors/popular - Get popular authors
router.get('/popular', authorController.getPopularAuthors);

// GET /api/authors/search - Search authors
router.get('/search', authorController.searchAuthors);

// GET /api/authors/nationality/:nationality - Get authors by nationality
router.get('/nationality/:nationality', authorController.getAuthorsByNationality);

// GET /api/authors/:id - Get a single author by ID
router.get('/:id', authorController.getAuthorById);

// POST /api/authors - Create a new author
router.post('/', authorController.createAuthor);

// PUT /api/authors/:id - Update an author
router.put('/:id', authorController.updateAuthor);

// DELETE /api/authors/:id - Delete an author
router.delete('/:id', authorController.deleteAuthor);

module.exports = router;