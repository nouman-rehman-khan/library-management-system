import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
      
      <Typography variant="h2" component="h1" gutterBottom>
        404
      </Typography>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
        Please check the URL or navigate back to the dashboard.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/"
        startIcon={<HomeIcon />}
        size="large"
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;