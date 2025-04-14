// categoryController
const db = require('../config/db');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.CategoryID, c.CategoryName, c.Description, c.ParentCategoryID,
             p.CategoryName as ParentCategoryName
      FROM Categories c
      LEFT JOIN Categories p ON c.ParentCategoryID = p.CategoryID
      ORDER BY COALESCE(p.CategoryName, c.CategoryName), c.CategoryName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Get category details
    const [categoryRows] = await db.query(`
      SELECT c.CategoryID, c.CategoryName, c.Description, c.ParentCategoryID,
             p.CategoryName as ParentCategoryName
      FROM Categories c
      LEFT JOIN Categories p ON c.ParentCategoryID = p.CategoryID
      WHERE c.CategoryID = ?
    `, [categoryId]);
    
    if (categoryRows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get subcategories
    const [subcategoryRows] = await db.query(`
      SELECT CategoryID, CategoryName, Description
      FROM Categories
      WHERE ParentCategoryID = ?
      ORDER BY CategoryName
    `, [categoryId]);
    
    // Get books in this category
    const [bookRows] = await db.query(`
      SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
             GROUP_CONCAT(CONCAT(a.FirstName, ' ', a.LastName) SEPARATOR ', ') AS Authors
      FROM Books b
      LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
      LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
      WHERE b.CategoryID = ?
      GROUP BY b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies
      ORDER BY b.Title
    `, [categoryId]);
    
    const category = {
      ...categoryRows[0],
      subcategories: subcategoryRows,
      books: bookRows
    };
    
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, description, parentCategoryId } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO Categories (CategoryName, Description, ParentCategoryID)
      VALUES (?, ?, ?)
    `, [categoryName, description, parentCategoryId || null]);
    
    res.status(201).json({ 
      message: 'Category created successfully', 
      categoryId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { categoryName, description, parentCategoryId } = req.body;
    
    // Check for circular references
    if (parentCategoryId) {
      let currentParentId = parentCategoryId;
      const visited = new Set();
      
      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return res.status(400).json({ 
            message: 'Circular reference detected. A category cannot be its own ancestor.' 
          });
        }
        
        if (currentParentId == categoryId) {
          return res.status(400).json({ 
            message: 'Circular reference detected. A category cannot be its own parent.' 
          });
        }
        
        visited.add(currentParentId);
        
        const [parentRows] = await db.query(`
          SELECT ParentCategoryID FROM Categories WHERE CategoryID = ?
        `, [currentParentId]);
        
        if (parentRows.length === 0) {
          break;
        }
        
        currentParentId = parentRows[0].ParentCategoryID;
      }
    }
    
    await db.query(`
      UPDATE Categories
      SET CategoryName = ?, Description = ?, ParentCategoryID = ?
      WHERE CategoryID = ?
    `, [categoryName, description, parentCategoryId || null, categoryId]);
    
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const [categoryRows] = await db.query('SELECT * FROM Categories WHERE CategoryID = ?', [categoryId]);
    if (categoryRows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has subcategories
    const [subcategoryCount] = await db.query(`
      SELECT COUNT(*) AS count FROM Categories WHERE ParentCategoryID = ?
    `, [categoryId]);
    
    if (subcategoryCount[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Update or remove subcategories first.' 
      });
    }
    
    // Check if category has books
    const [bookCount] = await db.query(`
      SELECT COUNT(*) AS count FROM Books WHERE CategoryID = ?
    `, [categoryId]);
    
    if (bookCount[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with books. Update or remove books first.' 
      });
    }
    
    // Delete the category
    await db.query('DELETE FROM Categories WHERE CategoryID = ?', [categoryId]);
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Get top-level categories (categories without a parent)
exports.getTopLevelCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT CategoryID, CategoryName, Description
      FROM Categories
      WHERE ParentCategoryID IS NULL
      ORDER BY CategoryName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching top-level categories:', error);
    res.status(500).json({ 
      message: 'Error fetching top-level categories', 
      error: error.message 
    });
  }
};

// Get subcategories of a category
exports.getSubcategories = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const [rows] = await db.query(`
      SELECT CategoryID, CategoryName, Description
      FROM Categories
      WHERE ParentCategoryID = ?
      ORDER BY CategoryName
    `, [categoryId]);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
  }
};

// Get categories with book counts
exports.getCategoriesWithBookCounts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.CategoryID, c.CategoryName, COUNT(b.BookID) AS BookCount
      FROM Categories c
      LEFT JOIN Books b ON c.CategoryID = b.CategoryID
      GROUP BY c.CategoryID, c.CategoryName
      ORDER BY BookCount DESC, c.CategoryName
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching categories with book counts:', error);
    res.status(500).json({ 
      message: 'Error fetching categories with book counts', 
      error: error.message 
    });
  }
};