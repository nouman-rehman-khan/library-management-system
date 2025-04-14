// publisherRoutes
const express = require('express');
const publisherController = require('../controllers/publisherController');

const router = express.Router();

// GET /api/publishers - Get all publishers
router.get('/', publisherController.getAllPublishers);

// GET /api/publishers/book-counts - Get publishers with book counts
router.get('/book-counts', publisherController.getPublishersWithBookCounts);

// GET /api/publishers/search - Search publishers
router.get('/search', publisherController.searchPublishers);

// GET /api/publishers/:id - Get a single publisher by ID
router.get('/:id', publisherController.getPublisherById);

// POST /api/publishers - Create a new publisher
router.post('/', publisherController.createPublisher);

// PUT /api/publishers/:id - Update a publisher
router.put('/:id', publisherController.updatePublisher);

// DELETE /api/publishers/:id - Delete a publisher
router.delete('/:id', publisherController.deletePublisher);

module.exports = router;