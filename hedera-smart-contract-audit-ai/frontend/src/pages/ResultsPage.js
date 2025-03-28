import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  Link,
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import BugReportIcon from '@mui/icons-material/BugReport';
import apiService from '../services/api';
import { VulnerabilityCard, SeveritySummary, LoadingSpinner, ErrorDisplay } from '../components';

const ResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState('');
  const [contractCode, setContractCode] = useState('');

  useEffect(() => {
    if (location.state) {
      // If we have data from navigation state, use it
      setAnalysisData(location.state);
      setContractCode(location.state.code || '');
      setLoading(false);
    } else if (id) {
      // Otherwise fetch it from the API
      fetchAnalysisResults(id);
    } else {
      setError('Analysis ID not provided');
      setLoading(false);
    }
  }, [location.state, id]);

  const fetchAnalysisResults = async (analysisId) => {
    try {
      setLoading(true);
      const data = await apiService.getAnalysisResults(analysisId);
      setAnalysisData(data);
      setContractCode(data.code || '');
    } catch (err) {
      console.error('Error fetching analysis results:', err);
      setError('Failed to fetch analysis results. Please try analyzing the contract again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <ErrorIcon color="error" />;
      case 'High':
        return <ReportIcon sx={{ color: '#ff5722' }} />;
      case 'Medium':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'Low':
        return <InfoIcon sx={{ color: '#2196f3' }} />;
      case 'Informational':
        return <BugReportIcon sx={{ color: '#4caf50' }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'error';
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      case 'Informational':
        return 'success';
      default:
        return 'default';
    }
  };

  const groupBySeverity = (vulnerabilities) => {
    const grouped = {
      Critical: [],
      High: [],
      Medium: [],
      Low: [],
      Informational: [],
    };

    vulnerabilities.forEach((vuln) => {
      if (grouped[vuln.severity]) {
        grouped[vuln.severity].push(vuln);
      } else {
        // Default to Informational if severity is not recognized
        grouped.Informational.push(vuln);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <LoadingSpinner 
          message="Loading analysis results..." 
          size="large" 
          sx={{ height: '50vh' }}
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <ErrorDisplay 
            message={error}
            withIcon={true}
            onRetry={() => id && fetchAnalysisResults(id)}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button component={RouterLink} to="/analyze" variant="contained">
              Back to Analyzer
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!analysisData) {
    return null;
  }

  const { contractName, vulnerabilities = [], reportUrl } = analysisData;
  const groupedVulnerabilities = groupBySeverity(vulnerabilities);
  const totalVulnerabilities = vulnerabilities.length;
  
  const severityCounts = {
    Critical: groupedVulnerabilities.Critical.length,
    High: groupedVulnerabilities.High.length,
    Medium: groupedVulnerabilities.Medium.length,
    Low: groupedVulnerabilities.Low.length,
    Informational: groupedVulnerabilities.Informational.length,
  };

  const riskLevel = severityCounts.Critical > 0 
    ? 'Critical' 
    : severityCounts.High > 0 
      ? 'High' 
      : severityCounts.Medium > 0 
        ? 'Medium' 
        : severityCounts.Low > 0 
          ? 'Low' 
          : 'Safe';

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analysis Results
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5">{contractName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Risk Level:
                </Typography>
                <Chip
                  label={riskLevel}
                  color={getSeverityColor(riskLevel)}
                  icon={getSeverityIcon(riskLevel)}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <SeveritySummary vulnerabilities={vulnerabilities} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  component={RouterLink} 
                  to="/analyze" 
                  variant="outlined"
                >
                  Analyze Another Contract
                </Button>
                {reportUrl && (
                  <Button 
                    component={Link}
                    href={reportUrl}
                    target="_blank"
                    rel="noopener"
                    variant="contained" 
                    color="primary"
                  >
                    View Full Report
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Vulnerabilities Details */}
        {totalVulnerabilities > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Detailed Findings
            </Typography>
            {['Critical', 'High', 'Medium', 'Low', 'Informational'].map((severity) => (
              groupedVulnerabilities[severity].length > 0 && (
                <Box key={severity} sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 
                        severity === 'Critical' ? '#d32f2f' :
                        severity === 'High' ? '#f44336' :
                        severity === 'Medium' ? '#ff9800' :
                        severity === 'Low' ? '#2196f3' : 
                        '#4caf50'
                    }}
                  >
                    {getSeverityIcon(severity)}
                    <span style={{ marginLeft: '8px' }}>{severity} Issues ({groupedVulnerabilities[severity].length})</span>
                  </Typography>
                  {groupedVulnerabilities[severity].map((vulnerability, index) => (
                    <VulnerabilityCard
                      key={`${severity}-${index}`}
                      vulnerability={vulnerability}
                      contractCode={contractCode}
                      defaultExpanded={index === 0 && severity === 'Critical'}
                    />
                  ))}
                </Box>
              )
            ))}
          </Box>
        ) : (
          <Alert severity="success" sx={{ mt: 2 }}>
            No vulnerabilities were found in your contract! However, this does not guarantee that the contract is completely secure. Always conduct thorough testing and consider professional audit services before deploying to production.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ResultsPage; 