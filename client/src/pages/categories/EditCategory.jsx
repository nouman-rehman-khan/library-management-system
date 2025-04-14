import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  // Removed ListItemSecondary as it doesn't exist
  Collapse,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore,
  MenuBook as MenuBookIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getAllCategories, getTopLevelCategories, getCategoriesWithBookCounts, getSubcategories, deleteCategory } from '../../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [bookCounts, setBookCounts] = useState({});
  const [topLevelCategories, setTopLevelCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    categoryId: null,
    title: '',
    message: '',
  });

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel for better performance
        const [allCategories, categoriesWithBookCounts, topLevelCats] = await Promise.all([
          getAllCategories(),
          getCategoriesWithBookCounts(),
          getTopLevelCategories(),
        ]);
        
        setCategories(allCategories);
        
        // Convert book counts array to an object for easier access
        const countsObj = {};
        categoriesWithBookCounts.forEach(category => {
          countsObj[category.CategoryID] = category.BookCount;
        });
        setBookCounts(countsObj);
        
        setTopLevelCategories(topLevelCats);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [refreshKey]);

  // Handle category expand/collapse
  const handleToggleExpand = async (categoryId) => {
    // If not already expanded, fetch subcategories
    if (!expandedCategories[categoryId]) {
      try {
        const subcategories = await getSubcategories(categoryId);
        
        // Update categories with subcategories
        setCategories(prevCategories => {
          const updatedCategories = [...prevCategories];
          subcategories.forEach(subcat => {
            if (!updatedCategories.find(c => c.CategoryID === subcat.CategoryID)) {
              updatedCategories.push(subcat);
            }
          });
          return updatedCategories;
        });
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError(err);
      }
    }
    
    // Toggle expanded state
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
    setExpandedCategories({});
  };

  // Handle delete category
  const handleDeleteClick = (categoryId) => {
    const categoryToDelete = categories.find(category => category.CategoryID === categoryId);
    
    setConfirmDialog({
      open: true,
      categoryId,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${categoryToDelete.CategoryName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(confirmDialog.categoryId);
      
      // Refresh the category list
      setRefreshKey(oldKey => oldKey + 1);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    } catch (err) {
      console.error('Error deleting category:', err);
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

  // Find subcategories for a given category
  const findSubcategories = (parentId) => {
    return categories.filter(category => category.ParentCategoryID === parentId);
  };

  // Render category item with its subcategories
  const renderCategoryItem = (category) => {
    const subcategories = findSubcategories(category.CategoryID);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories[category.CategoryID] || false;
    const bookCount = bookCounts[category.CategoryID] || 0;
    
    return (
      <Box key={category.CategoryID}>
        <ListItem
          disablePadding
          secondaryAction={
            <Box sx={{ display: 'flex' }}>
              <Tooltip title="Edit Category">
                <IconButton
                  component={Link}
                  to={`/categories/${category.CategoryID}/edit`}
                  size="small"
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Category">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(category.CategoryID)}
                  disabled={hasSubcategories || bookCount > 0}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <ListItemButton 
            component={Link}
            to={`/categories/${category.CategoryID}`}
            sx={{ pr: 12 }}
          >
            <ListItemIcon>
              <CategoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={category.CategoryName} 
              secondary={category.Description} 
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              <Chip 
                label={`${bookCount} books`} 
                size="small" 
                color={bookCount > 0 ? 'primary' : 'default'}
                variant="outlined"
              />
              
              {hasSubcategories && (
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleExpand(category.CategoryID);
                  }}
                  size="small"
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Box>
          </ListItemButton>
        </ListItem>
        
        {hasSubcategories && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {subcategories.map(subcat => (
                <Box key={subcat.CategoryID} sx={{ pl: 4 }}>
                  {renderCategoryItem(subcat)}
                </Box>
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  if (loading) return <LoadingSpinner message="Loading categories..." />;
  if (error) return <ErrorAlert error={error} onRetry={handleRefresh} />;

  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Categories" 
        button={<AddIcon />} 
        buttonText="Add Category" 
        buttonLink="/categories/add" 
        icon={CategoryIcon}
      />
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {topLevelCategories.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <CategoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No categories found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Add some categories to organize your books.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/categories/add"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add New Category
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%' }}>
          <List>
            {topLevelCategories.map(category => renderCategoryItem(category))}
          </List>
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
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default Categories;