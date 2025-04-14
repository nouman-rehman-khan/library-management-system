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
import { createPublisher } from '../../services/publisherService';

const AddPublisher = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    publisherName: '',
    address: '',
    contactInfo: '',
    yearEstablished: '',
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
    
    if (!formData.publisherName.trim()) {
      errors.publisherName = 'Publisher name is required';
    }
    
    if (formData.yearEstablished) {
      const year = parseInt(formData.yearEstablished);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(year) || year < 1000 || year > currentYear) {
        errors.yearEstablished = `Year must be between 1000 and ${currentYear}`;
      }
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
      
      const yearEstablished = formData.yearEstablished ? parseInt(formData.yearEstablished) : null;
      
      await createPublisher({
        publisherName: formData.publisherName,
        address: formData.address,
        contactInfo: formData.contactInfo,
        yearEstablished: yearEstablished,
      });
      
      // Navigate to the publishers page
      navigate('/publishers');
    } catch (err) {
      console.error('Error creating publisher:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      publisherName: '',
      address: '',
      contactInfo: '',
      yearEstablished: '',
    });
    setFormErrors({});
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/publishers"
          startIcon={<ArrowBackIcon />}
        >
          Back to Publishers
        </Button>
      </Box>
      
      <PageHeader title="Add New Publisher" />
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="publisherName"
                label="Publisher Name"
                fullWidth
                required
                value={formData.publisherName}
                onChange={handleChange}
                error={!!formErrors.publisherName}
                helperText={formErrors.publisherName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Publisher's address"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactInfo"
                label="Contact Information"
                fullWidth
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="Email, phone, website, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="yearEstablished"
                label="Year Established"
                type="number"
                fullWidth
                value={formData.yearEstablished}
                onChange={handleChange}
                error={!!formErrors.yearEstablished}
                helperText={formErrors.yearEstablished}
                inputProps={{ min: 1000, max: new Date().getFullYear() }}
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
                  Save Publisher
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

export default AddPublisher;