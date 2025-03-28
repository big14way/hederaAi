import React from 'react';
import { Box, Typography, Grid, Paper, LinearProgress } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';

/**
 * Component to display a summary of vulnerabilities by severity
 * 
 * @param {Object} props
 * @param {Array} props.vulnerabilities - Array of vulnerability objects
 */
const SeveritySummary = ({ vulnerabilities = [] }) => {
  // Count vulnerabilities by severity
  const countBySeverity = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Informational: 0
  };

  vulnerabilities.forEach(vuln => {
    if (vuln.severity in countBySeverity) {
      countBySeverity[vuln.severity]++;
    } else {
      countBySeverity.Informational++;
    }
  });

  const totalVulnerabilities = vulnerabilities.length;

  // Define colors and icons for each severity
  const severityInfo = {
    Critical: {
      color: '#d32f2f',
      icon: <ErrorIcon sx={{ color: '#d32f2f' }} />,
      progressColor: 'error'
    },
    High: {
      color: '#f44336',
      icon: <ReportIcon sx={{ color: '#f44336' }} />,
      progressColor: 'error'
    },
    Medium: {
      color: '#ff9800',
      icon: <WarningIcon sx={{ color: '#ff9800' }} />,
      progressColor: 'warning'
    },
    Low: {
      color: '#2196f3',
      icon: <InfoIcon sx={{ color: '#2196f3' }} />,
      progressColor: 'info'
    },
    Informational: {
      color: '#4caf50',
      icon: <BugReportIcon sx={{ color: '#4caf50' }} />,
      progressColor: 'success'
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" gutterBottom>
          Vulnerability Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalVulnerabilities === 0 
            ? 'No vulnerabilities found' 
            : `Total vulnerabilities: ${totalVulnerabilities}`}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(countBySeverity).map(([severity, count]) => (
          <Grid item xs={12} sm={6} md={4} key={severity}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1 
            }}>
              {severityInfo[severity].icon}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {severity}
              </Typography>
              <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                {count}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={totalVulnerabilities > 0 ? (count / totalVulnerabilities) * 100 : 0}
              color={severityInfo[severity].progressColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default SeveritySummary; 