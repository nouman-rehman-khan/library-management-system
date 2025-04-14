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
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

// Components
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getAuthorById, deleteAuthor } from '../../services/authorService';

const AuthorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
  });

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuthorById(id);
      setAuthor(data);
    } catch (err) {
      console.error('Error fetching author details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  const handleDeleteClick = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Author',
      message: `Are you sure you want to delete "${author.FirstName} ${author.LastName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAuthor(id);
      setConfirmDialog({ ...confirmDialog, open: false });
      navigate('/authors', { replace: true });
    } catch (err) {
      console.error('Error deleting author:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (loading) return <LoadingSpinner message="Loading author details..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchAuthor} />;
  if (!author) return <ErrorAlert error={{ message: 'Author not found' }} />;

  const hasBooks = author.books && author.books.length > 0;

  return (
    <Container maxWidth="lg">
      <Button
        component={Link}
        to="/authors"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Authors
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1">
                {`${author.FirstName} ${author.LastName}`}
              </Typography>
            </Box>

            {author.Nationality && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PublicIcon color="action" />
                <Typography variant="subtitle1">
                  {author.Nationality}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Biography
            </Typography>
            <Typography variant="body1" paragraph>
              {author.Biography || 'No biography available for this author.'}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {hasBooks ? 'Books by this author:' : 'No books available for this author.'}
              </Typography>

              {hasBooks && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {author.books.map(book => (
                    <Chip
                      key={book.BookID}
                      icon={<MenuBookIcon />}
                      label={book.Title}
                      component={Link}
                      to={`/books/${book.BookID}`}
                      clickable
                      variant="outlined"
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
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
                  to={`/books/add`}
                  startIcon={<MenuBookIcon />}
                  fullWidth
                >
                  Add Book
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/authors/${author.AuthorID}/edit`}
                  startIcon={<EditIcon />}
                  fullWidth
                >
                  Edit Author
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  startIcon={<DeleteIcon />}
                  fullWidth
                  disabled={hasBooks}
                >
                  Delete Author
                </Button>
                {hasBooks && (
                  <Typography variant="caption" color="error">
                    Cannot delete author with associated books
                  </Typography>
                )}
              </Box>
            </Paper>

            {hasBooks && (
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Author Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Books:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {author.books.length}
                    </Typography>
                  </Box>
                  {author.books.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Latest Book:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {author.books.reduce((latest, book) => 
                          (!latest || book.PublicationYear > latest.PublicationYear) ? book : latest
                        , null)?.PublicationYear || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Paper>

      {hasBooks && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Books by {author.FirstName} {author.LastName}
          </Typography>
          
          <Grid container spacing={3}>
            {author.books.map(book => (
              <Grid item key={book.BookID} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea component={Link} to={`/books/${book.BookID}`}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom noWrap>
                        {book.Title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={book.PublicationYear || 'Unknown Year'} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      
                      {book.CategoryName && (
                        <Chip 
                          label={book.CategoryName} 
                          size="small" 
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                      )}
                      
                      <Chip 
                        label={book.AvailableCopies > 0 ? 'Available' : 'Not Available'} 
                        size="small" 
                        color={book.AvailableCopies > 0 ? 'success' : 'error'} 
                      />
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

export default AuthorDetails;