import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
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
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getAllLoans, getOverdueLoans, getCurrentLoans, returnBook } from '../../services/loanService';

// Calculate days difference between dates
const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    loanId: null,
    title: '',
    message: '',
  });

  // Fetch loans based on active tab
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        setError(null);

        let loansData;
        switch (tabValue) {
          case 0: // All loans
            loansData = await getAllLoans();
            break;
          case 1: // Current loans
            loansData = await getCurrentLoans();
            break;
          case 2: // Overdue loans
            loansData = await getOverdueLoans();
            break;
          default:
            loansData = await getAllLoans();
        }

        setLoans(loansData);
        setFilteredLoans(loansData);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [tabValue]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchTerm(query);
    if (!query.trim()) {
      setFilteredLoans(loans);
      return;
    }

    const filtered = loans.filter((loan) => {
      const searchStr = query.toLowerCase();
      return (
        (loan.BookTitle && loan.BookTitle.toLowerCase().includes(searchStr)) ||
        (loan.MemberName && loan.MemberName.toLowerCase().includes(searchStr)) ||
        (loan.LoanID && loan.LoanID.toString().includes(searchStr))
      );
    });

    setFilteredLoans(filtered);
  };

  // Handle return book
  const handleReturnBook = (loanId) => {
    const loan = loans.find((l) => l.LoanID === loanId);
    if (!loan) return;
    
    setConfirmDialog({
      open: true,
      loanId,
      title: 'Return Book',
      message: `Are you sure you want to mark "${loan.BookTitle}" as returned by ${loan.MemberName}?`,
    });
  };

  const handleConfirmReturn = async () => {
    try {
      await returnBook(confirmDialog.loanId);
      
      // Refresh the loans list
      const updatedLoans = await (tabValue === 0 
        ? getAllLoans() 
        : tabValue === 1 
          ? getCurrentLoans() 
          : getOverdueLoans());
      
      setLoans(updatedLoans);
      setFilteredLoans(updatedLoans);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    } catch (err) {
      console.error('Error returning book:', err);
      setError(err);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    }
  };

  const handleCancelReturn = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  // Get loan status and color
  const getLoanStatus = (loan) => {
    if (loan.ReturnDate) {
      return { text: 'Returned', color: 'success' };
    }
    
    const today = new Date();
    const dueDate = new Date(loan.DueDate);
    
    if (dueDate < today) {
      const daysOverdue = getDaysDifference(dueDate, today);
      return { text: `Overdue (${daysOverdue} days)`, color: 'error' };
    }
    
    const daysLeft = getDaysDifference(today, dueDate);
    return { text: `Due in ${daysLeft} days`, color: 'primary' };
  };

  if (loading) return <LoadingSpinner message="Loading loans..." />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <Container maxWidth="xl">
      <PageHeader 
        title="Loans" 
        button={<AddIcon />} 
        buttonText="Issue Book" 
        buttonLink="/loans/add" 
        icon={AssignmentIcon}
      />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="loan status tabs"
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                <Typography>All Loans</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon />
                <Typography>Current Loans</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                <Typography>Overdue Loans</Typography>
              </Box>
            }
          />
        </Tabs>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <SearchBar
          placeholder="Search by book title, member name, or loan ID..."
          onSearch={handleSearch}
          fullWidth
        />
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Book</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Loan Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fine</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="subtitle1" sx={{ py: 5 }}>
                      No loans found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => {
                  const status = getLoanStatus(loan);
                  return (
                    <TableRow key={loan.LoanID} hover>
                      <TableCell>{loan.LoanID || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BookIcon color="primary" fontSize="small" />
                          <Link 
                            to={`/books/${loan.BookID}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <Typography sx={{ '&:hover': { color: 'primary.main' } }}>
                              {loan.BookTitle || 'Unknown Book'}
                            </Typography>
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="primary" fontSize="small" />
                          <Link 
                            to={`/members/${loan.MemberID}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <Typography sx={{ '&:hover': { color: 'primary.main' } }}>
                              {loan.MemberName || 'Unknown Member'}
                            </Typography>
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {loan.LoanDate ? new Date(loan.LoanDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {loan.DueDate ? new Date(loan.DueDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status.text} 
                          color={status.color} 
                          size="small"
                          icon={status.color === 'error' ? <WarningIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        {(loan.ReturnDate && loan.FineAmount && typeof loan.FineAmount === 'number' && loan.FineAmount > 0)
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
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmReturn}
        onCancel={handleCancelReturn}
        confirmText="Return Book"
        confirmColor="primary"
      />
    </Container>
  );
};

export default Loans;