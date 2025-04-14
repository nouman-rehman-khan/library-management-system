import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Divider,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

// Services
import { createLoan } from '../../services/loanService';
import { getAllBooks, getBookById } from '../../services/bookService';
import { getAllMembers, getMemberById } from '../../services/memberService';

const AddLoan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedBookId = queryParams.get('bookId');
  const preselectedMemberId = queryParams.get('memberId');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    bookId: preselectedBookId || '',
    memberId: preselectedMemberId || '',
    loanDate: new Date(),
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Default: 21 days from now
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Options for select fields
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Selected book and member details
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch books and members
        const [booksData, membersData] = await Promise.all([
          getAllBooks(),
          getAllMembers(),
        ]);
        
        // Filter out books with no available copies
        const availableBooks = booksData.filter(book => book.AvailableCopies > 0);
        
        // Filter out members that are not active
        const activeMembers = membersData.filter(member => member.MembershipStatus === 'Active');
        
        setBooks(availableBooks);
        setMembers(activeMembers);
        
        // If we have preselected values, get their details
        if (preselectedBookId) {
          const bookDetails = await getBookById(preselectedBookId);
          setSelectedBook(bookDetails);
        }
        
        if (preselectedMemberId) {
          const memberDetails = await getMemberById(preselectedMemberId);
          setSelectedMember(memberDetails);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [preselectedBookId, preselectedMemberId]);

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
    
    // Fetch details for selected book or member
    if (name === 'bookId' && value) {
      getBookById(value)
        .then(data => setSelectedBook(data))
        .catch(err => console.error('Error fetching book details:', err));
    } else if (name === 'bookId' && !value) {
      setSelectedBook(null);
    }
    
    if (name === 'memberId' && value) {
      getMemberById(value)
        .then(data => setSelectedMember(data))
        .catch(err => console.error('Error fetching member details:', err));
    } else if (name === 'memberId' && !value) {
      setSelectedMember(null);
    }
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
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
    
    if (!formData.bookId) {
      errors.bookId = 'Book is required';
    }
    
    if (!formData.memberId) {
      errors.memberId = 'Member is required';
    }
    
    if (!formData.loanDate) {
      errors.loanDate = 'Loan date is required';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (formData.dueDate < formData.loanDate) {
      errors.dueDate = 'Due date must be after loan date';
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
      loanDate: formData.loanDate.toISOString().split('T')[0],
      dueDate: formData.dueDate.toISOString().split('T')[0],
    };
    
    // Submit form
    try {
      setSubmitting(true);
      setError(null);
      
      await createLoan(formattedData);
      
      // Navigate to the loans page
      navigate('/loans');
    } catch (err) {
      console.error('Error creating loan:', err);
      setError(err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading form data..." />;
  if (error && !submitting) return <ErrorAlert error={error} />;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/loans"
            startIcon={<ArrowBackIcon />}
          >
            Back to Loans
          </Button>
        </Box>
        
        <PageHeader title="Issue Book" />
        
        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.bookId}>
                  <InputLabel id="book-label">Select Book</InputLabel>
                  <Select
                    labelId="book-label"
                    name="bookId"
                    value={formData.bookId}
                    onChange={handleChange}
                    label="Select Book"
                  >
                    <MenuItem value="">
                      <em>Select a book</em>
                    </MenuItem>
                    {books.map((book) => (
                      <MenuItem key={book.BookID} value={book.BookID}>
                        {book.Title} ({book.AvailableCopies} available)
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.bookId && (
                    <FormHelperText>{formErrors.bookId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {selectedBook && (
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'background.paper' 
                    }}
                  >
                    <MenuBookIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {selectedBook.Title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ISBN: {selectedBook.ISBN}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${selectedBook.AvailableCopies} copies available`}
                      color={selectedBook.AvailableCopies > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.memberId}>
                  <InputLabel id="member-label">Select Member</InputLabel>
                  <Select
                    labelId="member-label"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    label="Select Member"
                  >
                    <MenuItem value="">
                      <em>Select a member</em>
                    </MenuItem>
                    {members.map((member) => (
                      <MenuItem key={member.MemberID} value={member.MemberID}>
                        {`${member.FirstName} ${member.LastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.memberId && (
                    <FormHelperText>{formErrors.memberId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {selectedMember && (
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'background.paper' 
                    }}
                  >
                    <PersonIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {`${selectedMember.FirstName} ${selectedMember.LastName}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {selectedMember.Email}
                      </Typography>
                    </Box>
                    <Chip 
                      label={selectedMember.MembershipStatus}
                      color={selectedMember.MembershipStatus === 'Active' ? 'success' : 'error'}
                      size="small"
                    />
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Loan Date"
                  value={formData.loanDate}
                  onChange={(date) => handleDateChange('loanDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.loanDate,
                      helperText: formErrors.loanDate
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(date) => handleDateChange('dueDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.dueDate,
                      helperText: formErrors.dueDate
                    }
                  }}
                  minDate={formData.loanDate}
                />
              </Grid>
              
              {selectedBook && selectedBook.AvailableCopies <= 1 && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    This is the last available copy of this book.
                  </Alert>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    component={Link}
                    to="/loans"
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
                    Issue Book
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

export default AddLoan;