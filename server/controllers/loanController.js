// loanController
const db = require('../config/db');

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
             m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS MemberName,
             b.BookID, b.Title AS BookTitle, b.ISBN
      FROM Loans l
      JOIN Members m ON l.MemberID = m.MemberID
      JOIN Books b ON l.BookID = b.BookID
      ORDER BY l.LoanDate DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
};

// Get a single loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loanId = req.params.id;
    
    const [rows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
             m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS MemberName, m.Email,
             b.BookID, b.Title AS BookTitle, b.ISBN
      FROM Loans l
      JOIN Members m ON l.MemberID = m.MemberID
      JOIN Books b ON l.BookID = b.BookID
      WHERE l.LoanID = ?
    `, [loanId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ message: 'Error fetching loan', error: error.message });
  }
};

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const { bookId, memberId, loanDate, dueDate } = req.body;
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Check if book is available
    const [bookRows] = await db.query(`
      SELECT AvailableCopies FROM Books WHERE BookID = ? FOR UPDATE
    `, [bookId]);
    
    if (bookRows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (bookRows[0].AvailableCopies <= 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Book is not available for loan' });
    }
    
    // Check if member exists and is active
    const [memberRows] = await db.query(`
      SELECT MembershipStatus FROM Members WHERE MemberID = ?
    `, [memberId]);
    
    if (memberRows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Member not found' });
    }
    
    if (memberRows[0].MembershipStatus !== 'Active') {
      await db.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Member's status is ${memberRows[0].MembershipStatus}. Only active members can borrow books.` 
      });
    }
    
    // Calculate due date if not provided (default: 21 days from loan date)
    const loanDateValue = loanDate || new Date().toISOString().split('T')[0];
    let dueDateValue = dueDate;
    
    if (!dueDateValue) {
      const date = new Date(loanDateValue);
      date.setDate(date.getDate() + 21);
      dueDateValue = date.toISOString().split('T')[0];
    }
    
    // Create loan
    const [result] = await db.query(`
      INSERT INTO Loans (BookID, MemberID, LoanDate, DueDate)
      VALUES (?, ?, ?, ?)
    `, [bookId, memberId, loanDateValue, dueDateValue]);
    
    // Update book available copies
    await db.query(`
      UPDATE Books SET AvailableCopies = AvailableCopies - 1
      WHERE BookID = ?
    `, [bookId]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Loan created successfully', 
      loanId: result.insertId 
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const loanId = req.params.id;
    const { returnDate } = req.body;
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Get loan details
    const [loanRows] = await db.query(`
      SELECT l.BookID, l.DueDate, l.ReturnDate
      FROM Loans l
      WHERE l.LoanID = ?
    `, [loanId]);
    
    if (loanRows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    if (loanRows[0].ReturnDate) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Book has already been returned' });
    }
    
    const bookId = loanRows[0].BookID;
    const dueDate = new Date(loanRows[0].DueDate);
    const returnDateValue = returnDate || new Date().toISOString().split('T')[0];
    const returnDateObj = new Date(returnDateValue);
    
    // Calculate fine if returned late (50 cents per day)
    let fineAmount = 0;
    if (returnDateObj > dueDate) {
      const daysLate = Math.ceil((returnDateObj - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * 0.50;
    }
    
    // Update loan with return date and fine
    await db.query(`
      UPDATE Loans
      SET ReturnDate = ?, FineAmount = ?
      WHERE LoanID = ?
    `, [returnDateValue, fineAmount, loanId]);
    
    // Update book available copies
    await db.query(`
      UPDATE Books SET AvailableCopies = AvailableCopies + 1
      WHERE BookID = ?
    `, [bookId]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({ 
      message: 'Book returned successfully', 
      fineAmount: fineAmount 
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
};

// Get overdue loans
exports.getOverdueLoans = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, DATEDIFF(CURDATE(), l.DueDate) AS DaysOverdue,
             m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS MemberName, m.Email, m.Phone,
             b.BookID, b.Title AS BookTitle, b.ISBN
      FROM Loans l
      JOIN Members m ON l.MemberID = m.MemberID
      JOIN Books b ON l.BookID = b.BookID
      WHERE l.ReturnDate IS NULL AND l.DueDate < CURDATE()
      ORDER BY DaysOverdue DESC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching overdue loans:', error);
    res.status(500).json({ message: 'Error fetching overdue loans', error: error.message });
  }
};

// Get current loans (not returned yet)
exports.getCurrentLoans = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate,
             CASE
                WHEN l.DueDate < CURDATE() THEN 'Overdue'
                ELSE 'Current'
             END AS Status,
             m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS MemberName,
             b.BookID, b.Title AS BookTitle, b.ISBN
      FROM Loans l
      JOIN Members m ON l.MemberID = m.MemberID
      JOIN Books b ON l.BookID = b.BookID
      WHERE l.ReturnDate IS NULL
      ORDER BY l.DueDate ASC
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching current loans:', error);
    res.status(500).json({ message: 'Error fetching current loans', error: error.message });
  }
};

// Get loans for a specific book
exports.getLoansByBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    const [rows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
             m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS MemberName
      FROM Loans l
      JOIN Members m ON l.MemberID = m.MemberID
      WHERE l.BookID = ?
      ORDER BY l.LoanDate DESC
    `, [bookId]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching loans by book:', error);
    res.status(500).json({ message: 'Error fetching loans by book', error: error.message });
  }
};

// Get loans for a specific member
exports.getLoansByMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    
    const [rows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
             b.BookID, b.Title AS BookTitle, b.ISBN,
             CASE
                WHEN l.ReturnDate IS NULL AND l.DueDate < CURDATE() THEN 'Overdue'
                WHEN l.ReturnDate IS NULL THEN 'Current'
                ELSE 'Returned'
             END AS Status
      FROM Loans l
      JOIN Books b ON l.BookID = b.BookID
      WHERE l.MemberID = ?
      ORDER BY l.LoanDate DESC
    `, [memberId]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching loans by member:', error);
    res.status(500).json({ message: 'Error fetching loans by member', error: error.message });
  }
};