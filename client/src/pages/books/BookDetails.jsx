import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Container,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Components
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getBookById, deleteBook } from '../../services/bookService';
import { returnBook } from '../../services/loanService';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    message: '',
  });

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookById(id);
      setBook(data);
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleDeleteClick = () => {
    setConfirmDialog({
      open: true,
      action: 'delete',
      title: 'Delete Book',
      message: `Are you sure you want to delete "${book.Title}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBook(id);
      setConfirmDialog({ ...confirmDialog, open: false });
      navigate('/books', { replace: true });
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleReturnBook = (loanId) => {
    setConfirmDialog({
      open: true,
      action: 'return',
      loanId: loanId,
      title: 'Return Book',
      message: 'Are you sure you want to mark this book as returned?',
    });
  };

  const handleConfirmReturn = async () => {
    try {
      await returnBook(confirmDialog.loanId);
      setConfirmDialog({ ...confirmDialog, open: false });
      fetchBook();
    } catch (err) {
      console.error('Error returning book:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (loading) return <LoadingSpinner message="Loading book details..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchBook} />;
  if (!book) return <ErrorAlert error={{ message: 'Book not found' }} />;

  return (
    <Container maxWidth="lg">
      <Button
        component={Link}
        to="/books"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Books
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MenuBookIcon color="primary" fontSize="large" />
              {book.Title}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {book.CategoryName && (
                <Chip
                  icon={<CategoryIcon />}
                  label={book.CategoryName}
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                label={book.AvailableCopies > 0 ? `Available: ${book.AvailableCopies}` : 'Not Available'}
                color={book.AvailableCopies > 0 ? 'success' : 'error'}
              />
              <Chip
                label={`Published: ${book.PublicationYear}`}
                variant="outlined"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Authors
            </Typography>
            {book.authors && book.authors.length > 0 ? (
              <List disablePadding>
                {book.authors.map((author) => (
                  <ListItem key={author.AuthorID} disablePadding>
                    <ListItemText
                      primary={
                        <Link to={`/authors/${author.AuthorID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Typography
                            sx={{
                              fontWeight: 'medium',
                              '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                            }}
                          >
                            {`${author.FirstName} ${author.LastName}`}
                          </Typography>
                        </Link>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No authors listed</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" />
              Publisher
            </Typography>
            {book.PublisherName ? (
              <Link to={`/publishers/${book.PublisherID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography
                  sx={{
                    fontWeight: 'medium',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                  }}
                >
                  {book.PublisherName}
                </Typography>
              </Link>
            ) : (
              <Typography variant="body2" color="text.secondary">No publisher listed</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" component="div">
              ISBN: {book.ISBN}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/loans/add?bookId=${book.BookID}`}
                  fullWidth
                  disabled={book.AvailableCopies <= 0}
                >
                  Issue Book
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/books/${book.BookID}/edit`}
                  startIcon={<EditIcon />}
                  fullWidth
                >
                  Edit Book
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  startIcon={<DeleteIcon />}
                  fullWidth
                >
                  Delete Book
                </Button>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Book Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Book ID" secondary={book.BookID} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Total Copies" secondary={book.AvailableCopies} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Publication Year" secondary={book.PublicationYear || 'Not specified'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Category" secondary={book.CategoryName || 'Not categorized'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Publisher" secondary={book.PublisherName || 'Not specified'} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Loan History
        </Typography>
        {book.loanHistory && book.loanHistory.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Loan Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Fine</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {book.loanHistory.map((loan) => (
                  <TableRow key={loan.LoanID}>
                    <TableCell>
                      <Link to={`/members/${loan.MemberID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography
                          sx={{
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                          }}
                        >
                          {loan.MemberName}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{new Date(loan.LoanDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(loan.DueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {loan.ReturnDate
                        ? new Date(loan.ReturnDate).toLocaleDateString()
                        : <Chip size="small" color="warning" label="Not returned" />
                      }
                    </TableCell>
                    <TableCell>
                      {loan.FineAmount > 0
                        ? `$${loan.FineAmount.toFixed(2)}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {!loan.ReturnDate && (
                        <Tooltip title="Mark as returned">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleReturnBook(loan.LoanID)}
                          >
                            <MenuBookIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            This book has not been borrowed yet.
          </Typography>
        )}
      </Paper>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.action === 'delete' ? 'Delete' : 'Return'}
        cancelText="Cancel"
        confirmColor={confirmDialog.action === 'delete' ? 'error' : 'primary'}
        onConfirm={confirmDialog.action === 'delete' ? handleConfirmDelete : handleConfirmReturn}
        onCancel={handleDialogClose}
      />
    </Container>
  );
};

export default BookDetails;