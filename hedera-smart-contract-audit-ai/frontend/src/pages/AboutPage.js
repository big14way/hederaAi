import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';

const AboutPage = () => {
  const features = [
    {
      title: 'Smart Contract Security Analysis',
      description: 'AI-powered detection of security vulnerabilities in Solidity code, including reentrancy attacks, overflows/underflows, and more.',
      icon: <SecurityIcon fontSize="large" color="primary" />
    },
    {
      title: 'Gas Optimization',
      description: 'Identify opportunities to reduce gas costs and improve overall contract efficiency.',
      icon: <SpeedIcon fontSize="large" color="primary" />
    },
    {
      title: 'Best Practices',
      description: 'Ensure your smart contracts follow industry standards and best practices for secure development.',
      icon: <CodeIcon fontSize="large" color="primary" />
    }
  ];

  const benefits = [
    'Reduce risk of financial loss from smart contract vulnerabilities',
    'Save development time with rapid automated analysis',
    'Improve code quality and maintainability',
    'Lower transaction costs with gas optimization',
    'Build user trust with secure, reliable contracts'
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About Hedera Smart Contract Audit AI
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Project Overview
          </Typography>
          <Typography variant="body1" paragraph>
            Hedera Smart Contract Audit AI is an advanced tool designed to help developers create more secure and efficient smart contracts on the Hedera platform. By leveraging artificial intelligence and machine learning algorithms trained on thousands of smart contracts, our tool can quickly identify potential vulnerabilities, gas inefficiencies, and suggest improvements to your code.
          </Typography>
          <Typography variant="body1" paragraph>
            Our mission is to improve the overall security of the blockchain ecosystem by making professional-grade security analysis accessible to all developers, regardless of their security expertise.
          </Typography>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Benefits
          </Typography>
          <List>
            {benefits.map((benefit, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={benefit} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body1" paragraph>
            Our audit tool works by analyzing your Solidity code in three main phases:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    1. Static Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We scan your code for known vulnerability patterns using advanced static analysis techniques.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    2. AI-Powered Review
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Our AI models analyze your contract logic to identify complex vulnerabilities that might be missed by traditional tools.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    3. Gas Optimization
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We identify inefficient code patterns and suggest optimizations to reduce transaction costs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default AboutPage; 