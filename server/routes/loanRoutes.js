// loanRoutes
const express = require('express');
const loanController = require('../controllers/loanController');

const router = express.Router();

// GET /api/loans - Get all loans
router.get('/', loanController.getAllLoans);

// GET /api/loans/overdue - Get overdue loans
router.get('/overdue', loanController.getOverdueLoans);

// GET /api/loans/current - Get current loans
router.get('/current', loanController.getCurrentLoans);

// GET /api/loans/book/:bookId - Get loans for a specific book
router.get('/book/:bookId', loanController.getLoansByBook);

// GET /api/loans/member/:memberId - Get loans for a specific member
router.get('/member/:memberId', loanController.getLoansByMember);

// GET /api/loans/:id - Get a single loan by ID
router.get('/:id', loanController.getLoanById);

// POST /api/loans - Create a new loan
router.post('/', loanController.createLoan);

// PUT /api/loans/:id/return - Return a book
router.put('/:id/return', loanController.returnBook);

module.exports = router;