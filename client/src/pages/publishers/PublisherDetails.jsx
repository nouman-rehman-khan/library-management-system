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
  Business as BusinessIcon,
  MenuBook as MenuBookIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Event as EventIcon,
} from '@mui/icons-material';

// Components
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getPublisherById, deletePublisher } from '../../services/publisherService';

const PublisherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
  });

  const fetchPublisher = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublisherById(id);
      setPublisher(data);
    } catch (err) {
      console.error('Error fetching publisher details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublisher();
  }, [id]);

  const handleDeleteClick = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Publisher',
      message: `Are you sure you want to delete "${publisher.PublisherName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePublisher(id);
      setConfirmDialog({ ...confirmDialog, open: false });
      navigate('/publishers', { replace: true });
    } catch (err) {
      console.error('Error deleting publisher:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (loading) return <LoadingSpinner message="Loading publisher details..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchPublisher} />;
  if (!publisher) return <ErrorAlert error={{ message: 'Publisher not found' }} />;

  const hasBooks = publisher.books && publisher.books.length > 0;

  return (
    <Container maxWidth="lg">
      <Button
        component={Link}
        to="/publishers"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Publishers
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <BusinessIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1">
                {publisher.PublisherName}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {publisher.Address && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOnIcon color="action" sx={{ mt: 0.5 }} />
                    <Typography variant="body1">
                      {publisher.Address}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {publisher.ContactInfo && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1">
                      {publisher.ContactInfo}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {publisher.YearEstablished && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="action" />
                    <Typography variant="body1">
                      Established: {publisher.YearEstablished}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
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
                  to={`/books/add?publisherId=${publisher.PublisherID}`}
                  startIcon={<MenuBookIcon />}
                  fullWidth
                >
                  Add Book
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/publishers/${publisher.PublisherID}/edit`}
                  startIcon={<EditIcon />}
                  fullWidth
                >
                  Edit Publisher
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  startIcon={<DeleteIcon />}
                  fullWidth
                  disabled={hasBooks}
                >
                  Delete Publisher
                </Button>
                {hasBooks && (
                  <Typography variant="caption" color="error">
                    Cannot delete publisher with associated books
                  </Typography>
                )}
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Publisher Statistics
              </Typography>
              <Typography variant="body1">
                {`Books published: ${publisher.books ? publisher.books.length : 0}`}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {hasBooks && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Books from this Publisher
          </Typography>
          
          <Grid container spacing={3}>
            {publisher.books.map(book => (
              <Grid item key={book.BookID} xs={12} sm={6} md={4} lg={3}>
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
                        {book.CategoryName && (
                          <Chip 
                            label={book.CategoryName} 
                            size="small" 
                            color="primary"
                          />
                        )}
                        
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

export default PublisherDetails;