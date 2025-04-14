import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Box,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
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
import { createBook } from '../../services/bookService';
import { getAllCategories } from '../../services/categoryService';
import { getAllPublishers } from '../../services/publisherService';
import { getAllAuthors } from '../../services/authorService';

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    publicationYear: new Date().getFullYear(),
    categoryId: '',
    publisherId: '',
    availableCopies: 1,
    authorIds: [],
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Options for select fields
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Parallel fetching for better performance
        const [categoriesData, publishersData, authorsData] = await Promise.all([
          getAllCategories(),
          getAllPublishers(),
          getAllAuthors(),
        ]);
        
        setCategories(categoriesData);
        setPublishers(publishersData);
        setAuthors(authorsData);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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

  // Handle author selection
  const handleAuthorChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      authorIds: value,
    });
    
    // Clear validation error
    if (formErrors.authorIds) {
      setFormErrors({
        ...formErrors,
        authorIds: undefined,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.isbn.trim()) {
      errors.isbn = 'ISBN is required';
    } else if (!/^[0-9-]{10,17}$/.test(formData.isbn.trim())) {
      errors.isbn = 'ISBN format is invalid';
    }
    
    if (formData.publicationYear) {
      const year = parseInt(formData.publicationYear);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(year) || year < 1000 || year > currentYear + 1) {
        errors.publicationYear = `Year must be between 1000 and ${currentYear + 1}`;
      }
    }
    
    if (formData.availableCopies === '' || formData.availableCopies < 0) {
      errors.availableCopies = 'Number of copies must be 0 or greater';
    }
    
    if (formData.authorIds.length === 0) {
      errors.authorIds = 'At least one author must be selected';
    }
    
    return errors;
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
    
    // Submit form
    try {
      setSubmitting(true);
      setError(null);
      
      await createBook(formData);
      
      // Navigate back to the books page after successful creation
      navigate('/books');
    } catch (err) {
      console.error('Error creating book:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      title: '',
      isbn: '',
      publicationYear: new Date().getFullYear(),
      categoryId: '',
      publisherId: '',
      availableCopies: 1,
      authorIds: [],
    });
    setFormErrors({});
  };

  if (loading) return <LoadingSpinner message="Loading form data..." />;
  if (error && !submitting) return <ErrorAlert error={error} />;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/books"
          startIcon={<ArrowBackIcon />}
        >
          Back to Books
        </Button>
      </Box>
      
      <PageHeader title="Add New Book" />
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Book Title"
                fullWidth
                required
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="isbn"
                label="ISBN"
                fullWidth
                required
                value={formData.isbn}
                onChange={handleChange}
                error={!!formErrors.isbn}
                helperText={formErrors.isbn}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="publicationYear"
                label="Publication Year"
                type="number"
                fullWidth
                value={formData.publicationYear}
                onChange={handleChange}
                error={!!formErrors.publicationYear}
                helperText={formErrors.publicationYear}
                inputProps={{ min: 1000, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.CategoryID} value={category.CategoryID}>
                      {category.CategoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="publisher-label">Publisher</InputLabel>
                <Select
                  labelId="publisher-label"
                  name="publisherId"
                  value={formData.publisherId}
                  onChange={handleChange}
                  label="Publisher"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {publishers.map((publisher) => (
                    <MenuItem key={publisher.PublisherID} value={publisher.PublisherID}>
                      {publisher.PublisherName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="availableCopies"
                label="Number of Copies"
                type="number"
                fullWidth
                required
                value={formData.availableCopies}
                onChange={handleChange}
                error={!!formErrors.availableCopies}
                helperText={formErrors.availableCopies}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Authors
              </Typography>
              <FormControl fullWidth error={!!formErrors.authorIds}>
                <InputLabel id="authors-label">Select Authors</InputLabel>
                <Select
                  labelId="authors-label"
                  multiple
                  value={formData.authorIds}
                  onChange={handleAuthorChange}
                  input={<OutlinedInput label="Select Authors" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((authorId) => {
                        const author = authors.find(a => a.AuthorID === authorId);
                        return (
                          <Chip 
                            key={authorId}
                            label={author ? `${author.FirstName} ${author.LastName}` : authorId}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {authors.map((author) => (
                    <MenuItem key={author.AuthorID} value={author.AuthorID}>
                      <Checkbox checked={formData.authorIds.indexOf(author.AuthorID) > -1} />
                      <ListItemText primary={`${author.FirstName} ${author.LastName}`} />
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.authorIds && (
                  <FormHelperText>{formErrors.authorIds}</FormHelperText>
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
                  Save Book
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {error && submitting && (
        <Box sx={{ mt: 2 }}>
          <ErrorAlert error={error} />
        </Box>
      )}
    </Container>
  );
};

export default AddBook;