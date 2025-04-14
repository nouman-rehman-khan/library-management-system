// bookController
const db = require('../config/db');

// Get all books with their authors, category, and publisher
exports.getAllBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             c.CategoryName, p.PublisherName,
             GROUP_CONCAT(CONCAT(a.FirstName, ' ', a.LastName) SEPARATOR ', ') AS Authors
      FROM Books b
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
      LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
      LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
      GROUP BY b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies, c.CategoryName, p.PublisherName
      ORDER BY b.Title
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    
    // Get book details
    const [bookRows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             b.CategoryID, c.CategoryName, 
             b.PublisherID, p.PublisherName
      FROM Books b
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
      WHERE b.BookID = ?
    `, [bookId]);
    
    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Get book authors
    const [authorRows] = await db.query(`
      SELECT a.AuthorID, a.FirstName, a.LastName
      FROM Authors a
      JOIN BookAuthors ba ON a.AuthorID = ba.AuthorID
      WHERE ba.BookID = ?
    `, [bookId]);
    
    // Get loan history
    const [loanRows] = await db.query(`
      SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
             m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS MemberName
      FROM Loans l
      JOIN Members m ON l.MemberID = m.MemberID
      WHERE l.BookID = ?
      ORDER BY l.LoanDate DESC
    `, [bookId]);
    
    const book = {
      ...bookRows[0],
      authors: authorRows,
      loanHistory: loanRows
    };
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { 
      title, 
      isbn, 
      publicationYear, 
      categoryId, 
      publisherId, 
      availableCopies, 
      authorIds 
    } = req.body;
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Insert book
    const [result] = await db.query(`
      INSERT INTO Books (Title, ISBN, PublicationYear, CategoryID, PublisherID, AvailableCopies)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, isbn, publicationYear, categoryId, publisherId, availableCopies]);
    
    const bookId = result.insertId;
    
    // Insert book-author relationships
    if (authorIds && authorIds.length > 0) {
      const authorValues = authorIds.map(authorId => [bookId, authorId]);
      await db.query(`
        INSERT INTO BookAuthors (BookID, AuthorID)
        VALUES ?
      `, [authorValues]);
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Book created successfully', 
      bookId: bookId 
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { 
      title, 
      isbn, 
      publicationYear, 
      categoryId, 
      publisherId, 
      availableCopies, 
      authorIds 
    } = req.body;
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Update book
    await db.query(`
      UPDATE Books
      SET Title = ?, ISBN = ?, PublicationYear = ?, 
          CategoryID = ?, PublisherID = ?, AvailableCopies = ?
      WHERE BookID = ?
    `, [title, isbn, publicationYear, categoryId, publisherId, availableCopies, bookId]);
    
    // Handle authors if provided
    if (authorIds) {
      // Delete existing book-author relationships
      await db.query('DELETE FROM BookAuthors WHERE BookID = ?', [bookId]);
      
      // Insert new book-author relationships
      if (authorIds.length > 0) {
        const authorValues = authorIds.map(authorId => [bookId, authorId]);
        await db.query(`
          INSERT INTO BookAuthors (BookID, AuthorID)
          VALUES ?
        `, [authorValues]);
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    
    // Check if book exists
    const [bookRows] = await db.query('SELECT * FROM Books WHERE BookID = ?', [bookId]);
    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Delete the book (cascade will handle related records)
    await db.query('DELETE FROM Books WHERE BookID = ?', [bookId]);
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
};

// Get popular books (most loaned)
exports.getPopularBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.BookID, b.Title, COUNT(l.LoanID) AS TimesLoaned
      FROM Books b
      JOIN Loans l ON b.BookID = l.BookID
      GROUP BY b.BookID, b.Title
      ORDER BY TimesLoaned DESC
      LIMIT 5
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    res.status(500).json({ message: 'Error fetching popular books', error: error.message });
  }
};

// Search books by title, author, or ISBN
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${query}%`;
    
    const [rows] = await db.query(`
      SELECT DISTINCT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             c.CategoryName, p.PublisherName
      FROM Books b
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
      LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
      LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
      WHERE b.Title LIKE ?
         OR b.ISBN LIKE ?
         OR CONCAT(a.FirstName, ' ', a.LastName) LIKE ?
      ORDER BY b.Title
    `, [searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
};

// Get books by category
exports.getBooksByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    const [rows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             c.CategoryName, p.PublisherName,
             GROUP_CONCAT(CONCAT(a.FirstName, ' ', a.LastName) SEPARATOR ', ') AS Authors
      FROM Books b
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
      LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
      LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
      WHERE b.CategoryID = ?
      GROUP BY b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies, c.CategoryName, p.PublisherName
      ORDER BY b.Title
    `, [categoryId]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({ message: 'Error fetching books by category', error: error.message });
  }
};

// Get books by author
exports.getBooksByAuthor = async (req, res) => {
  try {
    const authorId = req.params.authorId;
    
    const [rows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             c.CategoryName, p.PublisherName
      FROM Books b
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
      JOIN BookAuthors ba ON b.BookID = ba.BookID
      WHERE ba.AuthorID = ?
      ORDER BY b.PublicationYear DESC, b.Title
    `, [authorId]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ message: 'Error fetching books by author', error: error.message });
  }
};