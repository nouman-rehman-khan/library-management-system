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
import { getPublisherById, updatePublisher } from '../../services/publisherService';

const EditPublisher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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

  // Fetch publisher data
  useEffect(() => {
    const fetchPublisher = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const publisherData = await getPublisherById(id);
        
        // Map publisher data to form fields
        setFormData({
          publisherName: publisherData.PublisherName,
          address: publisherData.Address || '',
          contactInfo: publisherData.ContactInfo || '',
          yearEstablished: publisherData.YearEstablished || '',
        });
      } catch (err) {
        console.error('Error fetching publisher:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublisher();
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
      
      await updatePublisher(id, {
        publisherName: formData.publisherName,
        address: formData.address,
        contactInfo: formData.contactInfo,
        yearEstablished: yearEstablished,
      });
      
      // Navigate back to publisher details
      navigate(`/publishers/${id}`);
    } catch (err) {
      console.error('Error updating publisher:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading publisher data..." />;
  if (error && !submitting) return <ErrorAlert error={error} />;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to={`/publishers/${id}`}
          startIcon={<ArrowBackIcon />}
        >
          Back to Publisher Details
        </Button>
      </Box>
      
      <PageHeader title={`Edit Publisher: ${formData.publisherName}`} />
      
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
                  component={Link}
                  to={`/publishers/${id}`}
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

export default EditPublisher;