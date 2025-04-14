import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  MenuBook as MenuBookIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Components
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getCategoryById, deleteCategory } from '../../services/categoryService';

const CategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
  });

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategoryById(id);
      setCategory(data);
    } catch (err) {
      console.error('Error fetching category details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleDeleteClick = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.CategoryName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(id);
      setConfirmDialog({ ...confirmDialog, open: false });
      navigate('/categories', { replace: true });
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (loading) return <LoadingSpinner message="Loading category details..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchCategory} />;
  if (!category) return <ErrorAlert error={{ message: 'Category not found' }} />;

  const hasBooks = category.books && category.books.length > 0;
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const canDelete = !hasBooks && !hasSubcategories;

  return (
    <Container maxWidth="lg">
      <Button
        component={Link}
        to="/categories"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Categories
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CategoryIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1">
                {category.CategoryName}
              </Typography>
            </Box>

            {category.ParentCategoryName && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Parent Category: 
                  <Link 
                    to={`/categories/${category.ParentCategoryID}`}
                    style={{ marginLeft: '8px', textDecoration: 'none' }}
                  >
                    <Chip
                      label={category.ParentCategoryName}
                      component="span"
                      clickable
                      color="primary"
                      variant="outlined"
                    />
                  </Link>
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {category.Description || 'No description available for this category.'}
            </Typography>

            {hasSubcategories && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Subcategories
                </Typography>
                <List>
                  {category.subcategories.map(subcat => (
                    <ListItem key={subcat.CategoryID} disablePadding>
                      <ListItemButton component={Link} to={`/categories/${subcat.CategoryID}`}>
                        <ListItemIcon>
                          <CategoryIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={subcat.CategoryName} 
                          secondary={subcat.Description} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/books/add?categoryId=${category.CategoryID}`}
                  startIcon={<MenuBookIcon />}
                  fullWidth
                >
                  Add Book to Category
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/categories/add?parentId=${category.CategoryID}`}
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add Subcategory
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/categories/${category.CategoryID}/edit`}
                  startIcon={<EditIcon />}
                  fullWidth
                >
                  Edit Category
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  startIcon={<DeleteIcon />}
                  fullWidth
                  disabled={!canDelete}
                >
                  Delete Category
                </Button>
                {!canDelete && (
                  <Typography variant="caption" color="error">
                    Cannot delete category with books or subcategories
                  </Typography>
                )}
              </Box>
            </Paper>

            {hasBooks && (
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Typography variant="body1">
                  {`Books in this category: ${category.books.length}`}
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Paper>

      {hasBooks && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Books in this Category
          </Typography>
          
          <Grid container spacing={3}>
            {category.books.map(book => (
              <Grid item key={book.BookID} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea component={Link} to={`/books/${book.BookID}`}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom noWrap>
                        {book.Title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {book.Authors}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Chip 
                          label={book.PublicationYear || 'Unknown Year'} 
                          size="small" 
                          variant="outlined"
                        />
                        
                        <Chip 
                          label={book.AvailableCopies > 0 ? 'Available' : 'Not Available'} 
                          size="small" 
                          color={book.AvailableCopies > 0 ? 'success' : 'error'} 
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleDialogClose}
      />
    </Container>
  );
};

export default CategoryDetails;