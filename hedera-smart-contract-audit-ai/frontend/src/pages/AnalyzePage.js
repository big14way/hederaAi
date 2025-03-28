import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import apiService from '../services/api';
import { LoadingSpinner } from '../components';

// A minimal editor component for testing
const Editor = ({ value, onChange, height }) => {
  return (
    <Box 
      component="textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        width: '100%',
        height,
        fontFamily: 'monospace',
        fontSize: '14px',
        padding: '10px',
        border: 'none',
        outline: 'none',
        resize: 'none',
        bgcolor: '#1e1e1e',
        color: '#d4d4d4',
        overflowY: 'auto',
      }}
    />
  );
};

const AnalyzePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [checkGasEfficiency, setCheckGasEfficiency] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examples, setExamples] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedExample, setSelectedExample] = useState(null);

  useEffect(() => {
    // Mock example contracts for demo
    const mockExamples = [
      { 
        id: 'example1', 
        name: 'Simple Token', 
        description: 'A basic ERC20 token example',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name = "SimpleToken";
    string public symbol = "SIM";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18;
    
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        return true;
    }
}`
      },
      { 
        id: 'example2', 
        name: 'Vulnerable Token', 
        description: 'A token with security issues',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableToken {
    string public name = "VulnerableToken";
    string public symbol = "VULN";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**18;
    
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        // Missing balance check - can cause underflow
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        return true;
    }
    
    function withdraw() public {
        uint amount = balanceOf[msg.sender];
        // Reentrancy vulnerability
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balanceOf[msg.sender] = 0;
    }
}`
      },
      { 
        id: 'example3', 
        name: 'Simple Auction', 
        description: 'An auction contract example',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleAuction {
    address payable public beneficiary;
    uint public auctionEndTime;
    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) pendingReturns;
    bool public ended;
    
    constructor(uint _biddingTime, address payable _beneficiary) {
        beneficiary = _beneficiary;
        auctionEndTime = block.timestamp + _biddingTime;
    }
    
    function bid() public payable {
        require(block.timestamp <= auctionEndTime, "Auction ended");
        require(msg.value > highestBid, "Bid not high enough");
        
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }
        
        highestBidder = msg.sender;
        highestBid = msg.value;
    }
    
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }
    
    function auctionEnd() public {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended");
        require(!ended, "Auction already ended");
        
        ended = true;
        beneficiary.transfer(highestBid);
    }
}`
      }
    ];
    setExamples(mockExamples);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExampleSelection = (example) => {
    setCode(example.code);
    setContractName(example.name);
    setSelectedExample(example);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!code.trim()) {
      setError('Please enter contract code');
      return;
    }
    
    if (!contractName.trim()) {
      setError('Please enter contract name');
      return;
    }

    // Basic validation for solidity code
    if (!code.includes('contract ')) {
      setError('Invalid contract code. Make sure it contains a valid Solidity contract definition.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.analyzeContract({
        contractName,
        contractCode: code,
        checkGasEfficiency,
      });
      
      setLoading(false);
      
      // Navigate to results page with the analysis data
      navigate(`/results/${response.id}`, { 
        state: response 
      });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Analysis failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analyze Smart Contract
        </Typography>
        
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Upload Contract" />
          <Tab label="Example Contracts" />
        </Tabs>
        
        {selectedTab === 0 ? (
          <Paper elevation={2} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contract Name"
                    variant="outlined"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    required
                    helperText="Enter a name for your contract (e.g., MyToken.sol)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Paste your Solidity contract code:
                  </Typography>
                  <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, overflow: 'hidden' }}>
                    <Editor
                      height="400px"
                      value={code}
                      onChange={setCode}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Testing tip:</strong> For this demo, a contract is considered vulnerable if it has any of the following:
                    </Typography>
                    <Typography component="div" variant="body2">
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>Missing balance check: <code>balanceOf[msg.sender] -= value</code> without a <code>require</code> check</li>
                        <li>Reentrancy: External call with <code>call&#123;value: amount&#125;</code> before state update</li>
                        <li>Missing zero address check: No <code>require(to != address(0))</code> in transfer function</li>
                        <li>The word "vulnerable" in contract name or comments</li>
                      </ul>
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checkGasEfficiency}
                        onChange={(e) => setCheckGasEfficiency(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Include gas efficiency analysis"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading || !code.trim() || !contractName.trim()}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Analyze Contract'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        ) : (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select an example contract to analyze:
            </Typography>
            <Grid container spacing={2}>
              {examples.map((example) => (
                <Grid item xs={12} md={6} key={example.id}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      bgcolor: selectedExample?.id === example.id ? 'primary.light' : 'background.paper',
                      color: selectedExample?.id === example.id ? 'white' : 'inherit',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white',
                      },
                    }}
                    onClick={() => handleExampleSelection(example)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {example.name}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {example.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {selectedExample && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => handleSubmit(e)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Selected Example'}
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Box>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner message="Analyzing contract..." size="large" />
        </Box>
      )}
    </Container>
  );
};

export default AnalyzePage; 