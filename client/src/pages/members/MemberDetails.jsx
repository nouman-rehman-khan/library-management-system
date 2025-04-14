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
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MenuBook as MenuBookIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Components
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getMemberById, deleteMember } from '../../services/memberService';
import { returnBook } from '../../services/loanService';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    loanId: null,
    title: '',
    message: '',
  });

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMemberById(id);
      setMember(data);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleDeleteClick = () => {
    setConfirmDialog({
      open: true,
      action: 'delete',
      title: 'Delete Member',
      message: `Are you sure you want to delete "${member.FirstName} ${member.LastName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMember(id);
      setConfirmDialog({ ...confirmDialog, open: false });
      navigate('/members', { replace: true });
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleReturnBook = (loanId) => {
    const loan = member.loanHistory.find(l => l.LoanID === loanId);
    
    setConfirmDialog({
      open: true,
      action: 'return',
      loanId: loanId,
      title: 'Return Book',
      message: `Are you sure you want to mark "${loan.Title}" as returned?`,
    });
  };

  const handleConfirmReturn = async () => {
    try {
      await returnBook(confirmDialog.loanId);
      setConfirmDialog({ ...confirmDialog, open: false });
      fetchMember();
    } catch (err) {
      console.error('Error returning book:', err);
      setError(err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'warning';
      case 'Suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate if a loan is overdue
  const isLoanOverdue = (loan) => {
    if (loan.ReturnDate) return false;
    const today = new Date();
    const dueDate = new Date(loan.DueDate);
    return dueDate < today;
  };

  if (loading) return <LoadingSpinner message="Loading member details..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchMember} />;
  if (!member) return <ErrorAlert error={{ message: 'Member not found' }} />;

  // Count active and overdue loans
  const activeLoanCount = member.loanHistory.filter(loan => !loan.ReturnDate).length;
  const overdueLoanCount = member.loanHistory.filter(loan => !loan.ReturnDate && isLoanOverdue(loan)).length;

  return (
    <Container maxWidth="lg">
      <Button
        component={Link}
        to="/members"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Members
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1">
                {`${member.FirstName} ${member.LastName}`}
              </Typography>
            </Box>

            <Chip
              label={member.MembershipStatus}
              color={getStatusColor(member.MembershipStatus)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon color="primary" />
                  <Typography variant="subtitle1">Email</Typography>
                </Box>
                <Typography variant="body1">{member.Email}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="subtitle1">Phone</Typography>
                </Box>
                <Typography variant="body1">{member.Phone || 'Not provided'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1">Member Since</Typography>
                </Box>
                <Typography variant="body1">
                  {new Date(member.JoinDate).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1">Member ID</Typography>
                </Box>
                <Typography variant="body1">{member.MemberID}</Typography>
              </Grid>
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
                  component={Link}
                  to={`/loans/add?memberId=${member.MemberID}`}
                  fullWidth
                >
                  Issue Book
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/members/${member.MemberID}/edit`}
                  startIcon={<EditIcon />}
                  fullWidth
                >
                  Edit Member
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  startIcon={<DeleteIcon />}
                  fullWidth
                  disabled={activeLoanCount > 0}
                >
                  Delete Member
                </Button>
                {activeLoanCount > 0 && (
                  <Typography variant="caption" color="error">
                    Cannot delete member with active loans
                  </Typography>
                )}
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Loan Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Total Books Borrowed" 
                    secondary={member.loanHistory.length} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Currently Borrowed" 
                    secondary={activeLoanCount} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Overdue Books" 
                    secondary={
                      <Chip 
                        label={overdueLoanCount} 
                        color={overdueLoanCount > 0 ? 'error' : 'success'}
                        size="small"
                      />
                    } 
                  />
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
        {member.loanHistory && member.loanHistory.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell>Loan Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Fine</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {member.loanHistory.map((loan) => {
                  const overdue = isLoanOverdue(loan);
                  return (
                    <TableRow key={loan.LoanID}>
                      <TableCell>
                        <Link to={`/books/${loan.BookID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MenuBookIcon color="primary" fontSize="small" />
                            <Typography
                              sx={{
                                '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                              }}
                            >
                              {loan.Title}
                            </Typography>
                          </Box>
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
                        {loan.ReturnDate ? (
                          <Chip 
                            label="Returned" 
                            color="success" 
                            size="small" 
                          />
                        ) : overdue ? (
                          <Chip 
                            icon={<WarningIcon />}
                            label="Overdue" 
                            color="error" 
                            size="small" 
                          />
                        ) : (
                          <Chip 
                            label="Active" 
                            color="primary" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {loan.FineAmount > 0
                          ? `$${loan.FineAmount.toFixed(2)}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {!loan.ReturnDate && (
                          <Tooltip title="Return Book">
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            This member has not borrowed any books yet.
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

export default MemberDetails;