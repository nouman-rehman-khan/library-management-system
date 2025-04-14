import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

// Services
import { getAuthorById, updateAuthor } from '../../services/authorService';

// List of common nationalities for the dropdown
const COMMON_NATIONALITIES = [
  'American',
  'British',
  'Canadian',
  'Australian',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Russian',
  'Chinese',
  'Japanese',
  'Indian',
  'Brazilian',
  'Mexican',
  'Other'
];

const EditAuthor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    biography: '',
    nationality: '',
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch author data
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const authorData = await getAuthorById(id);
        
        // Map author data to form fields
        setFormData({
          firstName: authorData.FirstName,
          lastName: authorData.LastName,
          biography: authorData.Biography || '',
          nationality: authorData.Nationality || '',
        });
      } catch (err) {
        console.error('Error fetching author:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuthor();
  }, [id]);

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
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
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
      
      await updateAuthor(id, formData);
      
      // Navigate back to the author details page
      navigate(`/authors/${id}`);
    } catch (err) {
      console.error('Error updating author:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading author data..." />;
  if (error && !submitting) return <ErrorAlert error={error} />;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to={`/authors/${id}`}
          startIcon={<ArrowBackIcon />}
        >
          Back to Author Details
        </Button>
      </Box>
      
      <PageHeader title={`Edit Author: ${formData.firstName} ${formData.lastName}`} />
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="nationality"
                label="Nationality"
                select
                fullWidth
                value={formData.nationality}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select a nationality</em>
                </MenuItem>
                {COMMON_NATIONALITIES.map((nationality) => (
                  <MenuItem key={nationality} value={nationality}>
                    {nationality}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="biography"
                label="Biography"
                fullWidth
                multiline
                rows={4}
                value={formData.biography}
                onChange={handleChange}
                placeholder="Enter author's biographical information"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  component={Link}
                  to={`/authors/${id}`}
                  variant="outlined"
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  Save Changes
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

export default EditAuthor;