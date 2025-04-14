import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const BookCard = ({ book, onDelete }) => {
  return (
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
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBookIcon color="primary" />
          <Typography variant="subtitle2" color="text.secondary">
            {book.PublicationYear}
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '3.6em',
          }}
        >
          {book.Title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '3em',
          }}
        >
          {book.Authors}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {book.CategoryName && (
            <Chip
              label={book.CategoryName}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          <Chip
            label={book.AvailableCopies > 0 ? `Available: ${book.AvailableCopies}` : 'Not Available'}
            size="small"
            color={book.AvailableCopies > 0 ? 'success' : 'error'}
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button
          component={Link}
          to={`/books/${book.BookID}`}
          size="small"
          endIcon={<InfoIcon />}
        >
          Details
        </Button>
        
        <Box>
          <Tooltip title="Edit Book">
            <IconButton
              component={Link}
              to={`/books/${book.BookID}/edit`}
              size="small"
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete Book">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(book.BookID)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default BookCard;