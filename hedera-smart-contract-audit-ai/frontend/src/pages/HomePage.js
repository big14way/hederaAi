import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Alert,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import SpeedIcon from '@mui/icons-material/Speed';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Hedera Smart Contract Audit AI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Secure your Hedera smart contracts with AI-powered security analysis
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="body1">
            <strong>Demo Version:</strong> This is a testing application. For demonstration purposes, contracts are identified as vulnerable if they contain any of the following issues:
          </Typography>
          <ul>
            <li>Missing balance checks before token transfers</li>
            <li>Reentrancy patterns (external calls before state changes)</li>
            <li>Missing zero address validation</li>
            <li>The word "vulnerable" in contract name or comments</li>
          </ul>
        </Alert>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/analyze"
          sx={{ mt: 2 }}
        >
          Analyze Your Contract
        </Button>
      </Box>

      {/* Features */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom textAlign="center">
                AI-Powered Security
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Leverages advanced AI models to detect vulnerabilities and security issues in your smart contracts.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" component={RouterLink} to="/about">
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <CodeIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom textAlign="center">
                Detailed Reports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Provides comprehensive reports with line-by-line analysis and remediation suggestions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" component={RouterLink} to="/analyze">
                Try Now
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom textAlign="center">
                Gas Optimization
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Identifies gas inefficiencies to help you reduce transaction costs on the Hedera network.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" component={RouterLink} to="/analyze">
                Optimize Now
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage; 