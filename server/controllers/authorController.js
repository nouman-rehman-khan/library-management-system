// authorController
const db = require('../config/db');

// Get all authors
exports.getAllAuthors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM Authors
      ORDER BY LastName, FirstName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ message: 'Error fetching authors', error: error.message });
  }
};

// Get a single author by ID
exports.getAuthorById = async (req, res) => {
  try {
    const authorId = req.params.id;
    
    // Get author details
    const [authorRows] = await db.query(`
      SELECT * FROM Authors
      WHERE AuthorID = ?
    `, [authorId]);
    
    if (authorRows.length === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    // Get author's books
    const [bookRows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             c.CategoryName, p.PublisherName
      FROM Books b
      JOIN BookAuthors ba ON b.BookID = ba.BookID
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
      WHERE ba.AuthorID = ?
      ORDER BY b.PublicationYear DESC, b.Title
    `, [authorId]);
    
    const author = {
      ...authorRows[0],
      books: bookRows
    };
    
    res.status(200).json(author);
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ message: 'Error fetching author', error: error.message });
  }
};

// Create a new author
exports.createAuthor = async (req, res) => {
  try {
    const { firstName, lastName, biography, nationality } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO Authors (FirstName, LastName, Biography, Nationality)
      VALUES (?, ?, ?, ?)
    `, [firstName, lastName, biography, nationality]);
    
    res.status(201).json({ 
      message: 'Author created successfully', 
      authorId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ message: 'Error creating author', error: error.message });
  }
};

// Update an author
exports.updateAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;
    const { firstName, lastName, biography, nationality } = req.body;
    
    await db.query(`
      UPDATE Authors
      SET FirstName = ?, LastName = ?, Biography = ?, Nationality = ?
      WHERE AuthorID = ?
    `, [firstName, lastName, biography, nationality, authorId]);
    
    res.status(200).json({ message: 'Author updated successfully' });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ message: 'Error updating author', error: error.message });
  }
};

// Delete an author
exports.deleteAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;
    
    // Check if author exists
    const [authorRows] = await db.query('SELECT * FROM Authors WHERE AuthorID = ?', [authorId]);
    if (authorRows.length === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    // Check if author has books
    const [bookCount] = await db.query(`
      SELECT COUNT(*) AS bookCount
      FROM BookAuthors
      WHERE AuthorID = ?
    `, [authorId]);
    
    if (bookCount[0].bookCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete author with associated books. Remove book associations first.' 
      });
    }
    
    // Delete the author
    await db.query('DELETE FROM Authors WHERE AuthorID = ?', [authorId]);
    
    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ message: 'Error deleting author', error: error.message });
  }
};

// Get authors by nationality
exports.getAuthorsByNationality = async (req, res) => {
  try {
    const nationality = req.params.nationality;
    
    const [rows] = await db.query(`
      SELECT * FROM Authors
      WHERE Nationality = ?
      ORDER BY LastName, FirstName
    `, [nationality]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching authors by nationality:', error);
    res.status(500).json({ 
      message: 'Error fetching authors by nationality', 
      error: error.message 
    });
  }
};

// Search authors
exports.searchAuthors = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${query}%`;
    
    const [rows] = await db.query(`
      SELECT * FROM Authors
      WHERE FirstName LIKE ?
         OR LastName LIKE ?
         OR CONCAT(FirstName, ' ', LastName) LIKE ?
         OR Nationality LIKE ?
      ORDER BY LastName, FirstName
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error searching authors:', error);
    res.status(500).json({ message: 'Error searching authors', error: error.message });
  }
};

// Get popular authors (most books in the library)
exports.getPopularAuthors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.AuthorID, a.FirstName, a.LastName, a.Nationality, COUNT(ba.BookID) AS BookCount
      FROM Authors a
      JOIN BookAuthors ba ON a.AuthorID = ba.AuthorID
      GROUP BY a.AuthorID, a.FirstName, a.LastName, a.Nationality
      ORDER BY BookCount DESC
      LIMIT 5
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching popular authors:', error);
    res.status(500).json({ message: 'Error fetching popular authors', error: error.message });
  }
};