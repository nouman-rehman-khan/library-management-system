import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Clear as ClearIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import ErrorAlert from '../../components/ErrorAlert';

// Services
import { createAuthor } from '../../services/authorService';

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

const AddAuthor = () => {
  const navigate = useNavigate();
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
      
      await createAuthor(formData);
      
      // Navigate to the authors page
      navigate('/authors');
    } catch (err) {
      console.error('Error creating author:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      biography: '',
      nationality: '',
    });
    setFormErrors({});
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/authors"
          startIcon={<ArrowBackIcon />}
        >
          Back to Authors
        </Button>
      </Box>
      
      <PageHeader title="Add New Author" />
      
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
                  Save Author
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

export default AddAuthor;