// memberController
const db = require('../config/db');

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM Members
      ORDER BY LastName, FirstName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
};

// Get a single member by ID
exports.getMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Get member details
    const [memberRows] = await db.query(`
      SELECT * FROM Members
      WHERE MemberID = ?
    `, [memberId]);
    
    if (memberRows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Get loan history
    const [loanRows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
             b.BookID, b.Title, b.ISBN
      FROM Loans l
      JOIN Books b ON l.BookID = b.BookID
      WHERE l.MemberID = ?
      ORDER BY l.LoanDate DESC
    `, [memberId]);
    
    const member = {
      ...memberRows[0],
      loanHistory: loanRows
    };
    
    res.status(200).json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ message: 'Error fetching member', error: error.message });
  }
};

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      joinDate, 
      membershipStatus 
    } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO Members (FirstName, LastName, Email, Phone, JoinDate, MembershipStatus)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [firstName, lastName, email, phone, joinDate || new Date(), membershipStatus || 'Active']);
    
    res.status(201).json({ 
      message: 'Member created successfully', 
      memberId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ message: 'Error creating member', error: error.message });
  }
};

// Update a member
exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      joinDate, 
      membershipStatus 
    } = req.body;
    
    await db.query(`
      UPDATE Members
      SET FirstName = ?, LastName = ?, Email = ?, 
          Phone = ?, JoinDate = ?, MembershipStatus = ?
      WHERE MemberID = ?
    `, [firstName, lastName, email, phone, joinDate, membershipStatus, memberId]);
    
    res.status(200).json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    // Check if member exists
    const [memberRows] = await db.query('SELECT * FROM Members WHERE MemberID = ?', [memberId]);
    if (memberRows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if member has active loans
    const [activeLoans] = await db.query(`
      SELECT COUNT(*) AS activeLoansCount
      FROM Loans
      WHERE MemberID = ? AND ReturnDate IS NULL
    `, [memberId]);
    
    if (activeLoans[0].activeLoansCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete member with active loans. Please return all books first.' 
      });
    }
    
    // Delete the member (cascade will handle related records)
    await db.query('DELETE FROM Members WHERE MemberID = ?', [memberId]);
    
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Error deleting member', error: error.message });
  }
};

// Get members with overdue books
exports.getMembersWithOverdueBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT m.MemberID, m.FirstName, m.LastName, m.Email, m.Phone
      FROM Members m
      JOIN Loans l ON m.MemberID = l.MemberID
      WHERE l.ReturnDate IS NULL AND l.DueDate < CURDATE()
      ORDER BY m.LastName, m.FirstName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching members with overdue books:', error);
    res.status(500).json({ 
      message: 'Error fetching members with overdue books', 
      error: error.message 
    });
  }
};

// Get inactive members (no loans in the last 3 months)
exports.getInactiveMembers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.MemberID, m.FirstName, m.LastName, m.Email, m.MembershipStatus, m.JoinDate
      FROM Members m
      WHERE m.MemberID NOT IN (
        SELECT DISTINCT l.MemberID 
        FROM Loans l 
        WHERE l.LoanDate >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      )
      ORDER BY m.LastName, m.FirstName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching inactive members:', error);
    res.status(500).json({ 
      message: 'Error fetching inactive members', 
      error: error.message 
    });
  }
};

// Search members
exports.searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${query}%`;
    
    const [rows] = await db.query(`
      SELECT * FROM Members
      WHERE FirstName LIKE ?
         OR LastName LIKE ?
         OR Email LIKE ?
         OR Phone LIKE ?
      ORDER BY LastName, FirstName
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({ message: 'Error searching members', error: error.message });
  }
};