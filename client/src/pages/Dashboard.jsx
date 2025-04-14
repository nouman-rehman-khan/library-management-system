import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

// Services
import { getPopularBooks } from '../services/bookService';
import { getOverdueLoans, getCurrentLoans } from '../services/loanService';
import { getMembersWithOverdueBooks } from '../services/memberService';
import { getPopularAuthors } from '../services/authorService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    popularBooks: [],
    overdueLoans: [],
    currentLoans: [],
    membersWithOverdueBooks: [],
    popularAuthors: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        popularBooksData,
        overdueLoansData,
        currentLoansData,
        membersWithOverdueBooksData,
        popularAuthorsData,
      ] = await Promise.all([
        getPopularBooks(),
        getOverdueLoans(),
        getCurrentLoans(),
        getMembersWithOverdueBooks(),
        getPopularAuthors(),
      ]);

      setStats({
        popularBooks: popularBooksData,
        overdueLoans: overdueLoansData,
        currentLoans: currentLoansData,
        membersWithOverdueBooks: membersWithOverdueBooksData,
        popularAuthors: popularAuthorsData,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard data..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchDashboardData} />;

  const StatCard = ({ title, value, icon, color, link }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              p: 1,
              borderRadius: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" align="center" sx={{ mb: 2 }}>
          {value}
        </Typography>
        {link && (
          <Button
            component={Link}
            to={link}
            variant="outlined"
            color={color}
            size="small"
            fullWidth
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Dashboard" icon={TrendingUpIcon} />

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Books"
            value={stats.currentLoans.length + stats.overdueLoans.length}
            icon={<MenuBookIcon />}
            color="primary"
            link="/books"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Loans"
            value={stats.currentLoans.length}
            icon={<AssignmentIcon />}
            color="success"
            link="/loans"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Loans"
            value={stats.overdueLoans.length}
            icon={<WarningIcon />}
            color="error"
            link="/loans"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Members with Overdue"
            value={stats.membersWithOverdueBooks.length}
            icon={<PeopleIcon />}
            color="warning"
            link="/members"
          />
        </Grid>
      </Grid>

      {/* Popular Books and Authors */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MenuBookIcon color="primary" />
              Popular Books
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {stats.popularBooks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No book loan data available yet.
                </Typography>
              ) : (
                stats.popularBooks.slice(0, 5).map((book) => (
                  <ListItem
                    key={book.BookID}
                    component={Link}
                    to={`/books/${book.BookID}`}
                    sx={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <MenuBookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={book.Title}
                      secondary={`Borrowed ${book.TimesLoaned} times`}
                    />
                  </ListItem>
                ))
              )}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                to="/books"
                size="small"
                color="primary"
              >
                View All Books
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Popular Authors
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {stats.popularAuthors.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No author data available yet.
                </Typography>
              ) : (
                stats.popularAuthors.slice(0, 5).map((author) => (
                  <ListItem
                    key={author.AuthorID}
                    component={Link}
                    to={`/authors/${author.AuthorID}`}
                    sx={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${author.FirstName} ${author.LastName}`}
                      secondary={`${author.BookCount} books in library`}
                    />
                  </ListItem>
                ))
              )}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                to="/authors"
                size="small"
                color="primary"
              >
                View All Authors
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Overdue Loans */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Overdue Loans
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {stats.overdueLoans.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No overdue loans. Great job!
            </Typography>
          ) : (
            stats.overdueLoans.slice(0, 5).map((loan) => (
              <ListItem key={loan.LoanID}>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={loan.BookTitle}
                  secondary={`Borrowed by ${loan.MemberName} | Due: ${new Date(loan.DueDate).toLocaleDateString()} (${loan.DaysOverdue} days overdue)`}
                />
                <Button
                  component={Link}
                  to={`/members/${loan.MemberID}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  View Member
                </Button>
              </ListItem>
            ))
          )}
        </List>
        {stats.overdueLoans.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              component={Link}
              to="/loans"
              size="small"
              color="primary"
              variant="contained"
            >
              Manage Loans
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;