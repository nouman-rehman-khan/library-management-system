import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getAllAuthors, deleteAuthor, searchAuthors, getAuthorsByNationality } from '../../services/authorService';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [nationalities, setNationalities] = useState([]);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    authorId: null,
    title: '',
    message: '',
  });

  // Fetch authors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let authorsData;
        if (searchTerm) {
          authorsData = await searchAuthors(searchTerm);
        } else if (nationalityFilter) {
          authorsData = await getAuthorsByNationality(nationalityFilter);
        } else {
          authorsData = await getAllAuthors();
        }
        
        setAuthors(authorsData);
        setFilteredAuthors(authorsData);
        
        // Extract unique nationalities for the filter
        const uniqueNationalities = [...new Set(authorsData.map(author => author.Nationality).filter(Boolean))];
        setNationalities(uniqueNationalities);
      } catch (err) {
        console.error('Error fetching authors:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, nationalityFilter, refreshKey]);

  // Handle search
  const handleSearch = (query) => {
    setSearchTerm(query);
    setNationalityFilter('');
  };

  // Handle nationality filter change
  const handleNationalityChange = (event) => {
    setNationalityFilter(event.target.value);
    setSearchTerm('');
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
    setSearchTerm('');
    setNationalityFilter('');
  };

  // Handle delete author
  const handleDeleteClick = (authorId) => {
    const authorToDelete = authors.find(author => author.AuthorID === authorId);
    
    setConfirmDialog({
      open: true,
      authorId,
      title: 'Delete Author',
      message: `Are you sure you want to delete "${authorToDelete.FirstName} ${authorToDelete.LastName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAuthor(confirmDialog.authorId);
      
      // Refresh the author list
      setRefreshKey(oldKey => oldKey + 1);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    } catch (err) {
      console.error('Error deleting author:', err);
      setError(err);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  if (loading) return <LoadingSpinner message="Loading authors..." />;
  if (error) return <ErrorAlert error={error} onRetry={handleRefresh} />;

  return (
    <Container maxWidth="xl">
      <PageHeader 
        title="Authors" 
        button={<AddIcon />} 
        buttonText="Add Author" 
        buttonLink="/authors/add" 
        icon={PersonIcon}
      />
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search authors by name or nationality..." 
          fullWidth 
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="nationality-filter-label">Filter by Nationality</InputLabel>
          <Select
            labelId="nationality-filter-label"
            id="nationality-filter"
            value={nationalityFilter}
            label="Filter by Nationality"
            onChange={handleNationalityChange}
          >
            <MenuItem value="">
              <em>All Nationalities</em>
            </MenuItem>
            {nationalities.map(nationality => (
              <MenuItem key={nationality} value={nationality}>
                {nationality}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {filteredAuthors.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No authors found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Try adjusting your search or filters, or add a new author.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/authors/add"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add New Author
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAuthors.map(author => (
            <Grid item key={author.AuthorID} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" component="h2">
                      {`${author.FirstName} ${author.LastName}`}
                    </Typography>
                  </Box>
                  
                  {author.Nationality && (
                    <Chip 
                      label={author.Nationality} 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {author.Biography || 'No biography available.'}
                  </Typography>
                  
                  {author.BookCount && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MenuBookIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {author.BookCount} {author.BookCount === 1 ? 'book' : 'books'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    component={Link}
                    to={`/authors/${author.AuthorID}`}
                    size="small"
                  >
                    View Details
                  </Button>
                  
                  <Box>
                    <Tooltip title="Edit Author">
                      <IconButton
                        component={Link}
                        to={`/authors/${author.AuthorID}/edit`}
                        size="small"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Author">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(author.AuthorID)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default Authors;