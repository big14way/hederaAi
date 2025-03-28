import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading spinner component with optional message
 * 
 * @param {Object} props
 * @param {string} props.message - Optional message to display
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {Object} props.sx - Additional styles
 */
const LoadingSpinner = ({ message, size = 'medium', sx = {} }) => {
  // Map size string to actual size value
  const spinnerSize = {
    small: 24,
    medium: 40,
    large: 60
  }[size] || 40;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        py: 4,
        ...sx
      }}
    >
      <CircularProgress size={spinnerSize} sx={{ mb: message ? 2 : 0 }} />
      {message && (
        <Typography variant="body2" color="text.secondary" align="center">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner; 