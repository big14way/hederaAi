import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Paper,
  Collapse,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Component for selecting from example smart contracts
 * 
 * @param {Object} props
 * @param {Array} props.examples - Array of example contracts
 * @param {Function} props.onSelect - Function to call when an example is selected
 * @param {boolean} props.loading - Whether the examples are loading
 * @param {string} props.error - Error message if examples failed to load
 * @param {string} props.selectedExampleId - ID of the currently selected example
 */
const ExamplesSelector = ({
  examples = [],
  onSelect,
  loading = false,
  error = '',
  selectedExampleId = ''
}) => {
  const [expandedId, setExpandedId] = useState(null);

  const handleSelect = (example) => {
    onSelect(example);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'High':
        return <ErrorIcon fontSize="small" color="error" />;
      case 'Medium':
        return <WarningIcon fontSize="small" color="warning" />;
      case 'Low':
        return <WarningIcon fontSize="small" color="info" />;
      case 'Safe':
        return <CheckCircleIcon fontSize="small" color="success" />;
      default:
        return <WarningIcon fontSize="small" color="disabled" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (examples.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No example contracts available
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      <List sx={{ width: '100%', py: 0 }}>
        {examples.map((example) => (
          <React.Fragment key={example.id}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={selectedExampleId === example.id}
                onClick={() => handleSelect(example)}
                sx={{ pr: 1 }}
              >
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={example.name} 
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {example.category}
                      {example.severity && (
                        <Chip 
                          icon={getSeverityIcon(example.severity)} 
                          label={example.severity}
                          size="small"
                          color={
                            example.severity === 'High' ? 'error' :
                            example.severity === 'Medium' ? 'warning' :
                            example.severity === 'Low' ? 'info' :
                            example.severity === 'Safe' ? 'success' : 'default'
                          }
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  }
                />
                <Box onClick={(e) => { e.stopPropagation(); toggleExpand(example.id); }}>
                  {expandedId === example.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
              </ListItemButton>
            </ListItem>
            <Collapse in={expandedId === example.id} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2, pt: 0, pl: 9 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {example.description}
                </Typography>
                {example.vulnerabilityCount > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Contains {example.vulnerabilityCount} {example.vulnerabilityCount === 1 ? 'vulnerability' : 'vulnerabilities'}
                  </Typography>
                )}
              </Box>
            </Collapse>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ExamplesSelector; 