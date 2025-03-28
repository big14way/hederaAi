import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Hedera Smart Contract Audit AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered security analysis for smart contracts on the Hedera network.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton 
                color="primary" 
                aria-label="GitHub" 
                component={Link} 
                href="https://github.com/hedera-smart-contract-audit-ai" 
                target="_blank"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                aria-label="Twitter" 
                component={Link} 
                href="https://twitter.com/hedera" 
                target="_blank"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                aria-label="LinkedIn" 
                component={Link} 
                href="https://www.linkedin.com/company/hedera/" 
                target="_blank"
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  Home
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/analyze" color="inherit" underline="hover">
                  Analyze Contract
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/about" color="inherit" underline="hover">
                  About
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="https://hedera.com/learning" color="inherit" target="_blank" underline="hover">
                  Hedera Learning Center
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts" color="inherit" target="_blank" underline="hover">
                  Smart Contract Documentation
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="https://github.com/hashgraph/hedera-smart-contracts" color="inherit" target="_blank" underline="hover">
                  Hedera Smart Contract Examples
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}{' '}
          Hedera Smart Contract Audit AI. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Powered by{' '}
          <Link color="inherit" href="https://huggingface.co/" target="_blank">
            Hugging Face
          </Link>
          {' | '}
          <Link color="inherit" href="https://hedera.com/" target="_blank">
            Hedera
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 