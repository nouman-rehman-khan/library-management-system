const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// GET /api/categories/top-level - Get top-level categories
router.get('/top-level', categoryController.getTopLevelCategories);

// GET /api/categories/book-counts - Get categories with book counts
router.get('/book-counts', categoryController.getCategoriesWithBookCounts);

// GET /api/categories/:id/subcategories - Get subcategories of a category
router.get('/:id/subcategories', categoryController.getSubcategories);

// GET /api/categories/:id - Get a single category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create a new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update a category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;