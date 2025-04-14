// publisherController
const db = require('../config/db');

// Get all publishers
exports.getAllPublishers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM Publishers
      ORDER BY PublisherName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ message: 'Error fetching publishers', error: error.message });
  }
};

// Get a single publisher by ID
exports.getPublisherById = async (req, res) => {
  try {
    const publisherId = req.params.id;
    
    // Get publisher details
    const [publisherRows] = await db.query(`
      SELECT * FROM Publishers
      WHERE PublisherID = ?
    `, [publisherId]);
    
    if (publisherRows.length === 0) {
      return res.status(404).json({ message: 'Publisher not found' });
    }
    
    // Get books from this publisher
    const [bookRows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             c.CategoryName,
             GROUP_CONCAT(CONCAT(a.FirstName, ' ', a.LastName) SEPARATOR ', ') AS Authors
      FROM Books b
      LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
      LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
      WHERE b.PublisherID = ?
      GROUP BY b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies, c.CategoryName
      ORDER BY b.PublicationYear DESC, b.Title
    `, [publisherId]);
    
    const publisher = {
      ...publisherRows[0],
      books: bookRows
    };
    
    res.status(200).json(publisher);
  } catch (error) {
    console.error('Error fetching publisher:', error);
    res.status(500).json({ message: 'Error fetching publisher', error: error.message });
  }
};

// Create a new publisher
exports.createPublisher = async (req, res) => {
  try {
    const { publisherName, address, contactInfo, yearEstablished } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO Publishers (PublisherName, Address, ContactInfo, YearEstablished)
      VALUES (?, ?, ?, ?)
    `, [publisherName, address, contactInfo, yearEstablished]);
    
    res.status(201).json({ 
      message: 'Publisher created successfully', 
      publisherId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating publisher:', error);
    res.status(500).json({ message: 'Error creating publisher', error: error.message });
  }
};

// Update a publisher
exports.updatePublisher = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const { publisherName, address, contactInfo, yearEstablished } = req.body;
    
    await db.query(`
      UPDATE Publishers
      SET PublisherName = ?, Address = ?, ContactInfo = ?, YearEstablished = ?
      WHERE PublisherID = ?
    `, [publisherName, address, contactInfo, yearEstablished, publisherId]);
    
    res.status(200).json({ message: 'Publisher updated successfully' });
  } catch (error) {
    console.error('Error updating publisher:', error);
    res.status(500).json({ message: 'Error updating publisher', error: error.message });
  }
};

// Delete a publisher
exports.deletePublisher = async (req, res) => {
  try {
    const publisherId = req.params.id;
    
    // Check if publisher exists
    const [publisherRows] = await db.query('SELECT * FROM Publishers WHERE PublisherID = ?', [publisherId]);
    if (publisherRows.length === 0) {
      return res.status(404).json({ message: 'Publisher not found' });
    }
    
    // Check if publisher has books
    const [bookCount] = await db.query(`
      SELECT COUNT(*) AS count FROM Books WHERE PublisherID = ?
    `, [publisherId]);
    
    if (bookCount[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete publisher with associated books. Update or remove books first.' 
      });
    }
    
    // Delete the publisher
    await db.query('DELETE FROM Publishers WHERE PublisherID = ?', [publisherId]);
    
    res.status(200).json({ message: 'Publisher deleted successfully' });
  } catch (error) {
    console.error('Error deleting publisher:', error);
    res.status(500).json({ message: 'Error deleting publisher', error: error.message });
  }
};

// Get publishers with book counts
exports.getPublishersWithBookCounts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.PublisherID, p.PublisherName, COUNT(b.BookID) AS BookCount
      FROM Publishers p
      LEFT JOIN Books b ON p.PublisherID = b.PublisherID
      GROUP BY p.PublisherID, p.PublisherName
      ORDER BY BookCount DESC, p.PublisherName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching publishers with book counts:', error);
    res.status(500).json({ 
      message: 'Error fetching publishers with book counts', 
      error: error.message 
    });
  }
};

// Search publishers
exports.searchPublishers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${query}%`;
    
    const [rows] = await db.query(`
      SELECT * FROM Publishers
      WHERE PublisherName LIKE ?
         OR Address LIKE ?
         OR ContactInfo LIKE ?
      ORDER BY PublisherName
    `, [searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error searching publishers:', error);
    res.status(500).json({ message: 'Error searching publishers', error: error.message });
  }
};