import { useState, useEffect } from 'react';
import { Grid, Box, Chip, FormControl, InputLabel, Select, MenuItem, Button, Container } from '@mui/material';
import { Add as AddIcon, MenuBook as MenuBookIcon, Refresh as RefreshIcon } from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getAllBooks, searchBooks, deleteBook, getBooksByCategory } from '../../services/bookService';
import { getAllCategories } from '../../services/categoryService';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    bookId: null,
    title: '',
    message: '',
  });

  // Fetch books and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch books based on filters
        let booksData;
        if (searchTerm) {
          booksData = await searchBooks(searchTerm);
        } else if (selectedCategory) {
          booksData = await getBooksByCategory(selectedCategory);
        } else {
          booksData = await getAllBooks();
        }
        
        // Fetch categories for filter
        const categoriesData = await getAllCategories();
        
        setBooks(booksData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, selectedCategory, refreshKey]);

  // Handle search
  const handleSearch = (query) => {
    setSearchTerm(query);
    setSelectedCategory('');
  };

  // Handle category filter change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setSearchTerm('');
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Handle delete book
  const handleDeleteClick = (bookId) => {
    const bookToDelete = books.find(book => book.BookID === bookId);
    
    setConfirmDialog({
      open: true,
      bookId,
      title: 'Delete Book',
      message: `Are you sure you want to delete "${bookToDelete.Title}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBook(confirmDialog.bookId);
      
      // Refresh the book list
      setRefreshKey(oldKey => oldKey + 1);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  if (loading) return <LoadingSpinner message="Loading books..." />;
  if (error) return <ErrorAlert error={error} onRetry={handleRefresh} />;

  return (
    <Container maxWidth="xl">
      <PageHeader 
        title="Books" 
        button={<AddIcon />} 
        buttonText="Add Book" 
        buttonLink="/books/add" 
        icon={MenuBookIcon}
      />
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search books by title, author, or ISBN..." 
          fullWidth 
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-filter-label">Filter by Category</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={selectedCategory}
            label="Filter by Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {categories.map(category => (
              <MenuItem key={category.CategoryID} value={category.CategoryID}>
                {category.CategoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {books.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <MenuBookIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <h2>No books found</h2>
          <p>Try adjusting your search or filters, or add a new book.</p>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${books.length} books found`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <Grid container spacing={3}>
            {books.map(book => (
              <Grid item key={book.BookID} xs={12} sm={6} md={4} lg={3}>
                <BookCard book={book} onDelete={handleDeleteClick} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default Books;