import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Box,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

// Services
import { getMemberById, updateMember } from '../../services/memberService';

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joinDate: new Date(),
    membershipStatus: 'Active',
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const memberData = await getMemberById(id);
        
        // Map member data to form fields
        setFormData({
          firstName: memberData.FirstName,
          lastName: memberData.LastName,
          email: memberData.Email,
          phone: memberData.Phone || '',
          joinDate: new Date(memberData.JoinDate),
          membershipStatus: memberData.MembershipStatus,
        });
      } catch (err) {
        console.error('Error fetching member:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMember();
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

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      joinDate: date,
    });
    
    // Clear validation error
    if (formErrors.joinDate) {
      setFormErrors({
        ...formErrors,
        joinDate: undefined,
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
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())) {
      errors.email = 'Invalid email address';
    }
    
    if (formData.phone && !/^[0-9()-\s+]{7,20}$/.test(formData.phone.trim())) {
      errors.phone = 'Invalid phone number';
    }
    
    if (!formData.joinDate) {
      errors.joinDate = 'Join date is required';
    }
    
    if (!formData.membershipStatus) {
      errors.membershipStatus = 'Membership status is required';
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
    
    // Format dates for submission
    const formattedData = {
      ...formData,
      joinDate: formData.joinDate.toISOString().split('T')[0],
    };
    
    // Submit form
    try {
      setSubmitting(true);
      setError(null);
      
      await updateMember(id, formattedData);
      
      // Navigate back to the member details page
      navigate(`/members/${id}`);
    } catch (err) {
      console.error('Error updating member:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading member data..." />;
  if (error && !submitting) return <ErrorAlert error={error} />;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to={`/members/${id}`}
            startIcon={<ArrowBackIcon />}
          >
            Back to Member Details
          </Button>
        </Box>
        
        <PageHeader title={`Edit Member: ${formData.firstName} ${formData.lastName}`} />
        
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
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="phone"
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Join Date"
                  value={formData.joinDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.joinDate,
                      helperText: formErrors.joinDate
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.membershipStatus}>
                  <InputLabel id="status-label">Membership Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="membershipStatus"
                    value={formData.membershipStatus}
                    onChange={handleChange}
                    label="Membership Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                  </Select>
                  {formErrors.membershipStatus && (
                    <Typography variant="caption" color="error">
                      {formErrors.membershipStatus}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    component={Link}
                    to={`/members/${id}`}
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
    </LocalizationProvider>
  );
};

export default EditMember;