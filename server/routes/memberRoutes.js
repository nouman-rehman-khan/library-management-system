// memberRoutes
const express = require('express');
const memberController = require('../controllers/memberController');

const router = express.Router();

// GET /api/members - Get all members
router.get('/', memberController.getAllMembers);

// GET /api/members/overdue - Get members with overdue books
router.get('/overdue', memberController.getMembersWithOverdueBooks);

// GET /api/members/inactive - Get inactive members
router.get('/inactive', memberController.getInactiveMembers);

// GET /api/members/search - Search members
router.get('/search', memberController.searchMembers);

// GET /api/members/:id - Get a single member by ID
router.get('/:id', memberController.getMemberById);

// POST /api/members - Create a new member
router.post('/', memberController.createMember);

// PUT /api/members/:id - Update a member
router.put('/:id', memberController.updateMember);

// DELETE /api/members/:id - Delete a member
router.delete('/:id', memberController.deleteMember);

module.exports = router;