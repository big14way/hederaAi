import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * Component to display error messages with optional retry functionality
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {boolean} props.withIcon - Whether to show an error icon
 * @param {function} props.onRetry - Optional callback function for retry button
 * @param {Object} props.sx - Additional styles
 */
const ErrorDisplay = ({ 
  message = 'An error occurred', 
  withIcon = false,
  onRetry,
  sx = {}
}) => {
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        bgcolor: 'error.light',
        color: 'error.contrastText',
        ...sx
      }}
    >
      {withIcon && (
        <ErrorOutlineIcon 
          color="error" 
          sx={{ fontSize: 48, mb: 2 }} 
        />
      )}
      
      <Alert 
        severity="error"
        variant="filled"
        sx={{ mb: 2, width: '100%' }}
      >
        <Typography variant="body1">
          {message}
        </Typography>
      </Alert>
      
      {onRetry && (
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onRetry}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ErrorDisplay; 