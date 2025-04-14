import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, button, buttonText, buttonLink, icon: Icon }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {Icon && <Icon color="primary" />}
        {title}
      </Typography>
      
      {button && (
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={buttonLink}
          startIcon={button}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;