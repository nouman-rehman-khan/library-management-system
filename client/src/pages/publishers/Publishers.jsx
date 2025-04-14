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
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
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
import { getAllPublishers, deletePublisher, searchPublishers, getPublishersWithBookCounts } from '../../services/publisherService';

const Publishers = () => {
  const [publishers, setPublishers] = useState([]);
  const [filteredPublishers, setFilteredPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    publisherId: null,
    title: '',
    message: '',
  });

  // Fetch publishers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let publishersData;
        if (searchTerm) {
          publishersData = await searchPublishers(searchTerm);
        } else {
          // Fetch publishers with book counts for better display
          publishersData = await getPublishersWithBookCounts();
        }
        
        setPublishers(publishersData);
        setFilteredPublishers(publishersData);
      } catch (err) {
        console.error('Error fetching publishers:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, refreshKey]);

  // Handle search
  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
    setSearchTerm('');
  };

  // Handle delete publisher
  const handleDeleteClick = (publisherId) => {
    const publisherToDelete = publishers.find(publisher => publisher.PublisherID === publisherId);
    
    setConfirmDialog({
      open: true,
      publisherId,
      title: 'Delete Publisher',
      message: `Are you sure you want to delete "${publisherToDelete.PublisherName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePublisher(confirmDialog.publisherId);
      
      // Refresh the publisher list
      setRefreshKey(oldKey => oldKey + 1);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    } catch (err) {
      console.error('Error deleting publisher:', err);
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

  if (loading) return <LoadingSpinner message="Loading publishers..." />;
  if (error) return <ErrorAlert error={error} onRetry={handleRefresh} />;

  return (
    <Container maxWidth="xl">
      <PageHeader 
        title="Publishers" 
        button={<AddIcon />} 
        buttonText="Add Publisher" 
        buttonLink="/publishers/add" 
        icon={BusinessIcon}
      />
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search publishers by name or location..." 
          fullWidth 
        />
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {filteredPublishers.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No publishers found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Try adjusting your search or add a new publisher.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/publishers/add"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add New Publisher
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPublishers.map(publisher => (
            <Grid item key={publisher.PublisherID} xs={12} sm={6} md={4} lg={3}>
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
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" component="h2">
                      {publisher.PublisherName}
                    </Typography>
                  </Box>
                  
                  {publisher.YearEstablished && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Est. {publisher.YearEstablished}
                    </Typography>
                  )}
                  
                  {publisher.Address && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {publisher.Address}
                    </Typography>
                  )}
                  
                  {publisher.BookCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MenuBookIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {publisher.BookCount} {publisher.BookCount === 1 ? 'book' : 'books'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    component={Link}
                    to={`/publishers/${publisher.PublisherID}`}
                    size="small"
                  >
                    View Details
                  </Button>
                  
                  <Box>
                    <Tooltip title="Edit Publisher">
                      <IconButton
                        component={Link}
                        to={`/publishers/${publisher.PublisherID}/edit`}
                        size="small"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Publisher">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(publisher.PublisherID)}
                        disabled={publisher.BookCount > 0}
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

export default Publishers;