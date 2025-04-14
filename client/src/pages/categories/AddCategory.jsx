import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

// Services
import { createCategory, getAllCategories } from '../../services/categoryService';

const AddCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedParentId = queryParams.get('parentId');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    parentCategoryId: preselectedParentId || '',
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.categoryName.trim()) {
      errors.categoryName = 'Category name is required';
    }
    
    return errors;
  };

  // Check for circular references in parent categories
  const wouldCreateCircularReference = (parentId) => {
    if (!parentId) return false;
    
    // Can't make a category its own parent
    if (parentId === formData.categoryId) return true;
    
    // Find the parent category
    const parent = categories.find(c => c.CategoryID === parseInt(parentId));
    if (!parent) return false;
    
    // Check if this category is in the parent's ancestry
    let currentParentId = parent.ParentCategoryID;
    const visited = new Set();
    
    while (currentParentId) {
      if (visited.has(currentParentId)) {
        // Circular reference detected in existing categories
        return true;
      }
      
      visited.add(currentParentId);
      
      const currentParent = categories.find(c => c.CategoryID === currentParentId);
      if (!currentParent) break;
      
      currentParentId = currentParent.ParentCategoryID;
    }
    
    return false;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Check for circular references
    if (wouldCreateCircularReference(formData.parentCategoryId)) {
      setFormErrors({
        ...formErrors,
        parentCategoryId: 'Cannot create circular reference in category hierarchy',
      });
      return;
    }
    
    // Submit form
    try {
      setSubmitting(true);
      setError(null);
      
      const parentId = formData.parentCategoryId ? parseInt(formData.parentCategoryId) : null;
      
      await createCategory({
        categoryName: formData.categoryName,
        description: formData.description,
        parentCategoryId: parentId,
      });
      
      // Navigate to the categories page
      navigate('/categories');
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      categoryName: '',
      description: '',
      parentCategoryId: preselectedParentId || '',
    });
    setFormErrors({});
  };

  if (loading) return <LoadingSpinner message="Loading categories..." />;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/categories"
          startIcon={<ArrowBackIcon />}
        >
          Back to Categories
        </Button>
      </Box>
      
      <PageHeader title="Add New Category" />
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="categoryName"
                label="Category Name"
                fullWidth
                required
                value={formData.categoryName}
                onChange={handleChange}
                error={!!formErrors.categoryName}
                helperText={formErrors.categoryName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.parentCategoryId}>
                <InputLabel id="parent-category-label">Parent Category</InputLabel>
                <Select
                  labelId="parent-category-label"
                  name="parentCategoryId"
                  value={formData.parentCategoryId}
                  onChange={handleChange}
                  label="Parent Category"
                >
                  <MenuItem value="">
                    <em>None (Top-level category)</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.parentCategoryId && (
                  <Typography variant="caption" color="error">
                    {formErrors.parentCategoryId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  Save Category
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {error && (
        <Box sx={{ mt: 2 }}>
          <ErrorAlert error={error} />
        </Box>
      )}
    </Container>
  );
};

export default AddCategory;