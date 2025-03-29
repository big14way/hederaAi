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
  Tabs,
  Tab,
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import BugReportIcon from '@mui/icons-material/BugReport';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import apiService from '../services/api';
import { VulnerabilityCard, SeveritySummary, LoadingSpinner, ErrorDisplay, CodeHighlighter } from '../components';

const ResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [analysisResults, setAnalysisResults] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [contractSource, setContractSource] = useState('');

  useEffect(() => {
    if (location.state) {
      // If we have data from navigation state, use it
      setAnalysisResults(location.state);
      setContractSource(location.state.code || '');
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
      setAnalysisResults(data);
      setContractSource(data.code || '');
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

  if (!analysisResults) {
    return null;
  }

  const { contractName, code: contractCode, vulnerabilities = [], timestamp } = analysisResults;
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

  // Calculate risk score (0-100)
  const calculateRiskScore = () => {
    if (totalVulnerabilities === 0) return 100; // Perfect score
    
    const severity = {
      'Critical': 25,
      'High': 15, 
      'Medium': 8,
      'Low': 3,
      'Informational': 1
    };
    
    let totalImpact = 0;
    vulnerabilities.forEach(vuln => {
      totalImpact += severity[vuln.severity] || 0;
    });
    
    // Cap the score at 100 points max
    const score = Math.max(0, 100 - totalImpact);
    return Math.round(score);
  };

  const riskScore = calculateRiskScore();

  const VulnerabilityFixes = ({ vulnerability }) => {
    const { recommendation } = vulnerability;
    
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Recommended Fix:
        </Typography>
        <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
          {recommendation}
        </Typography>
        
        {vulnerability.fixedCodeSnippet && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Fixed Code Example:
            </Typography>
            <CodeHighlighter 
              code={vulnerability.fixedCodeSnippet}
              language="solidity"
            />
          </Box>
        )}
      </Box>
    );
  };

  const handleExportReport = () => {
    // In a real app, this would generate a PDF report
    alert('In a production version, this would generate a downloadable PDF report with the complete analysis.');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              Analysis Results: {contractName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyzed on {new Date(timestamp).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportReport}
              sx={{ mb: 1, mr: 1 }}
            >
              Export Report
            </Button>
            <Button
              component={RouterLink}
              to="/analyze"
              variant="contained"
            >
              New Analysis
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analysis tabs">
          <Tab label="Overview" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab 
            label={`Vulnerabilities (${totalVulnerabilities})`} 
            icon={<BugReportIcon />}
            iconPosition="start"
            disabled={totalVulnerabilities === 0}
          />
          <Tab label="Full Report" />
          <Tab label="Contract Code" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Security Score
              </Typography>
              <Box sx={{ 
                position: 'relative', 
                width: 160, 
                height: 160, 
                mx: 'auto',
                my: 2,
                borderRadius: '50%',
                bgcolor: riskScore > 85 ? 'success.light' : riskScore > 65 ? 'warning.light' : 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Typography variant="h3" color={riskScore > 85 ? 'success.dark' : riskScore > 65 ? 'warning.dark' : 'error.dark'}>
                  {riskScore}
                </Typography>
              </Box>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                {riskScore > 85 ? 'Good' : riskScore > 65 ? 'Needs Improvement' : 'Critical Issues'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                {totalVulnerabilities === 0 ? (
                  'No vulnerabilities detected! Your contract appears secure based on our analysis.'
                ) : (
                  `We detected ${totalVulnerabilities} potential issues in your contract. ${severityCounts.Critical > 0 ? 'Critical vulnerabilities require immediate attention.' : severityCounts.High > 0 ? 'High severity issues should be addressed before deployment.' : 'Consider addressing these issues before deployment.'}`
                )}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              
              <SeveritySummary vulnerabilities={vulnerabilities} />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Key Findings:
                </Typography>
                {totalVulnerabilities === 0 ? (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    No vulnerabilities detected! Your contract appears secure based on our analysis.
                  </Alert>
                ) : (
                  <Box component="ul" sx={{ pl: 2 }}>
                    {severityCounts.Critical > 0 && (
                      <Typography component="li" variant="body2" color="error.main" sx={{ mb: 1 }}>
                        {severityCounts.Critical} critical vulnerabilities detected - these require immediate attention
                      </Typography>
                    )}
                    {severityCounts.High > 0 && (
                      <Typography component="li" variant="body2" color="warning.main" sx={{ mb: 1 }}>
                        {severityCounts.High} high severity issues that should be fixed before deployment
                      </Typography>
                    )}
                    {severityCounts.Medium > 0 && (
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        {severityCounts.Medium} medium severity issues that should be addressed
                      </Typography>
                    )}
                    {(severityCounts.Low > 0 || severityCounts.Informational > 0) && (
                      <Typography component="li" variant="body2">
                        {severityCounts.Low + severityCounts.Informational} low/informational issues
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recommendations:
                </Typography>
                {totalVulnerabilities === 0 ? (
                  <Typography variant="body2">
                    Your contract looks good! Consider adding more comprehensive test coverage and documentation.
                  </Typography>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {severityCounts.Critical > 0 || severityCounts.High > 0 ? 
                        'Address all critical and high severity issues before deploying this contract to production.' : 
                        'Consider fixing the identified issues to improve your contract security.'}
                    </Typography>
                  </Alert>
                )}
              </Box>
              
              {totalVulnerabilities > 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setActiveTab(1)}
                  >
                    View Detailed Vulnerabilities
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Detected Vulnerabilities
          </Typography>
          
          {totalVulnerabilities === 0 ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              No vulnerabilities detected! Your contract appears secure based on our analysis.
            </Alert>
          ) : (
            Object.keys(groupedVulnerabilities).map(severity => (
              groupedVulnerabilities[severity].length > 0 && (
                <Box key={severity} sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: severity === 'Critical' ? 'error.main' : 
                             severity === 'High' ? 'warning.main' : 
                             severity === 'Medium' ? 'info.main' : 
                             'text.primary'
                    }}
                  >
                    {severity} Severity ({groupedVulnerabilities[severity].length})
                  </Typography>
                  {groupedVulnerabilities[severity].map((vulnerability, index) => (
                    <Box key={`${severity}-${index}`}>
                      <VulnerabilityCard
                        vulnerability={vulnerability}
                        contractCode={contractSource}
                        defaultExpanded={index === 0 && severity === 'Critical'}
                      />
                      <VulnerabilityFixes vulnerability={vulnerability} />
                    </Box>
                  ))}
                </Box>
              )
            ))
          )}
        </Paper>
      </Box>

      <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Full Security Report
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              1. Executive Summary
            </Typography>
            <Typography variant="body2" paragraph>
              This report presents the results of an automated security audit of the <strong>{contractName}</strong> smart contract performed on {new Date(timestamp).toLocaleDateString()}. 
              The analysis identified {totalVulnerabilities} potential security issues.
            </Typography>
            <Typography variant="body2" paragraph>
              Security Score: <strong>{riskScore}/100</strong> - {riskScore > 85 ? 'Good' : riskScore > 65 ? 'Needs Improvement' : 'Critical Issues'}
            </Typography>
            <Typography variant="body2" paragraph>
              {totalVulnerabilities === 0 
                ? 'The contract appears to be well-structured and no security vulnerabilities were identified during this automated audit.' 
                : `The contract has ${severityCounts.Critical > 0 ? 'critical' : severityCounts.High > 0 ? 'significant' : 'some'} security concerns that should be addressed before deployment.`}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              2. Audit Scope
            </Typography>
            <Typography variant="body2" paragraph>
              The security assessment was performed on the Solidity smart contract <strong>{contractName}</strong>.
            </Typography>
            <Typography variant="body2" paragraph>
              The audit focused on identifying common security vulnerabilities including:
            </Typography>
            <Box component="ul" sx={{ pl: 4 }}>
              <Typography component="li" variant="body2">Reentrancy vulnerabilities</Typography>
              <Typography component="li" variant="body2">Access control issues</Typography>
              <Typography component="li" variant="body2">Integer overflow/underflow</Typography>
              <Typography component="li" variant="body2">Unchecked external calls</Typography>
              <Typography component="li" variant="body2">Gas optimization issues</Typography>
              <Typography component="li" variant="body2">Business logic vulnerabilities</Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              3. Findings Overview
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Vulnerabilities by Severity:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={2}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: severityCounts.Critical > 0 ? 'error.light' : 'background.paper'
                    }}
                  >
                    <Typography variant="h5">
                      {severityCounts.Critical}
                    </Typography>
                    <Typography variant="body2">Critical</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: severityCounts.High > 0 ? 'warning.light' : 'background.paper'
                    }}
                  >
                    <Typography variant="h5">
                      {severityCounts.High}
                    </Typography>
                    <Typography variant="body2">High</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: severityCounts.Medium > 0 ? 'info.light' : 'background.paper'
                    }}
                  >
                    <Typography variant="h5">
                      {severityCounts.Medium}
                    </Typography>
                    <Typography variant="body2">Medium</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h5">
                      {severityCounts.Low}
                    </Typography>
                    <Typography variant="body2">Low</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h5">
                      {severityCounts.Informational}
                    </Typography>
                    <Typography variant="body2">Info</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {totalVulnerabilities === 0 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No vulnerabilities detected! The contract appears to be well-structured and secure.
                </Alert>
              ) : (
                <Typography variant="body2" paragraph>
                  The audit identified {totalVulnerabilities} potential security issues across {Object.keys(groupedVulnerabilities).filter(key => groupedVulnerabilities[key].length > 0).length} categories. 
                  The most serious concerns are {severityCounts.Critical > 0 ? 'critical vulnerabilities that could lead to loss of funds or contract control.' : severityCounts.High > 0 ? 'high severity issues that should be fixed before deployment.' : 'medium and low severity issues that should be reviewed.'}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              4. Detailed Findings
            </Typography>
            
            {totalVulnerabilities === 0 ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                No vulnerabilities detected!
              </Alert>
            ) : (
              Object.keys(groupedVulnerabilities).map(severity => (
                groupedVulnerabilities[severity].length > 0 && (
                  <Box key={severity} sx={{ mb: 4 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold"
                      sx={{ 
                        mb: 2, 
                        color: severity === 'Critical' ? 'error.main' : 
                              severity === 'High' ? 'warning.main' : 
                              severity === 'Medium' ? 'info.main' : 
                              'text.primary'
                      }}
                    >
                      {severity} Severity Issues:
                    </Typography>
                    
                    {groupedVulnerabilities[severity].map((vulnerability, index) => (
                      <Box key={`${severity}-${index}`} sx={{ mb: 3, pl: 2, borderLeft: 2, borderColor: 'grey.300' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {index + 1}. {vulnerability.title}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {vulnerability.description}
                        </Typography>
                        <Typography variant="subtitle2">
                          Recommendation:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {vulnerability.recommendation}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )
              ))
            )}
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              5. Recommendations Summary
            </Typography>
            
            {totalVulnerabilities === 0 ? (
              <Box>
                <Typography variant="body2" paragraph>
                  No vulnerabilities were detected in this automated security audit. However, we recommend:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  <Typography component="li" variant="body2">Conduct a manual security review by security experts.</Typography>
                  <Typography component="li" variant="body2">Implement comprehensive testing with high code coverage.</Typography>
                  <Typography component="li" variant="body2">Deploy to testnet before mainnet to ensure proper functionality.</Typography>
                  <Typography component="li" variant="body2">Consider a formal verification process for critical contracts.</Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" paragraph>
                  Based on the identified issues, we recommend the following actions:
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  {severityCounts.Critical > 0 && (
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      <strong>Critical Priority:</strong> Address all critical vulnerabilities before deployment.
                    </Typography>
                  )}
                  {severityCounts.High > 0 && (
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      <strong>High Priority:</strong> Fix high severity issues to prevent potential security incidents.
                    </Typography>
                  )}
                  {severityCounts.Medium > 0 && (
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      <strong>Medium Priority:</strong> Address medium severity issues to strengthen the contract's security.
                    </Typography>
                  )}
                  {(severityCounts.Low > 0 || severityCounts.Informational > 0) && (
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      <strong>Low Priority:</strong> Review and address low severity and informational issues when possible.
                    </Typography>
                  )}
                  <Typography component="li" variant="body2">
                    <strong>General:</strong> Implement proper testing and consider a manual audit before deployment.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              6. Conclusion
            </Typography>
            
            <Typography variant="body2" paragraph>
              {totalVulnerabilities === 0 
                ? 'The smart contract appears to be well-structured and no security vulnerabilities were identified during this automated audit. However, automated tools have limitations, and a manual security review is recommended before production deployment.'
                : `The security audit of the ${contractName} smart contract identified ${totalVulnerabilities} potential security issues that should be addressed. We recommend fixing these issues and conducting a follow-up audit to ensure they have been properly resolved before deploying the contract.`}
            </Typography>
            
            <Typography variant="body2">
              Security is an ongoing process. Even after deploying a secure contract, continue monitoring for new vulnerabilities and consider implementing an upgrade mechanism for critical fixes.
            </Typography>
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportReport}
            >
              Export Full Report as PDF
            </Button>
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Contract Source Code
          </Typography>
          <Box sx={{ mt: 2, bgcolor: 'grey.900', borderRadius: 1, overflow: 'hidden' }}>
            <CodeHighlighter code={contractSource} language="solidity" />
          </Box>
        </Paper>
      </Box>
      
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Button
          component={RouterLink}
          to="/analyze"
          variant="contained"
          color="primary"
          size="large"
        >
          Analyze Another Contract
        </Button>
      </Box>
    </Container>
  );
};

export default ResultsPage; 