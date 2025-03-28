import React from 'react';
import { Card, CardContent, Typography, Box, Button, CardActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * A reusable card component for displaying features
 * 
 * @param {Object} props
 * @param {string} props.title - The feature title
 * @param {string} props.description - The feature description
 * @param {React.ReactNode} props.icon - The icon component to display
 * @param {string} props.buttonText - Optional text for the action button
 * @param {string} props.buttonLink - Optional link for the action button
 * @param {Function} props.buttonAction - Optional callback function for the button
 * @param {Object} props.sx - Optional sx props for the Card component
 */
const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  buttonLink, 
  buttonAction,
  sx = {} 
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        ...sx
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {icon && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" component="h3" gutterBottom align="center">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {description}
        </Typography>
      </CardContent>
      
      {(buttonText && (buttonLink || buttonAction)) && (
        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
          {buttonLink ? (
            <Button 
              component={RouterLink} 
              to={buttonLink} 
              variant="contained" 
              color="primary"
              size="small"
            >
              {buttonText}
            </Button>
          ) : (
            <Button 
              onClick={buttonAction} 
              variant="contained" 
              color="primary"
              size="small"
            >
              {buttonText}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default FeatureCard; 