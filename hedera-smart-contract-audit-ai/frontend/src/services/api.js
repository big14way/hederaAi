import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Mock data for testing
const mockExamples = [
  { id: 'example1', name: 'Simple Storage', code: 'pragma solidity ^0.8.0;\n\ncontract SimpleStorage {\n    uint256 private storedData;\n\n    function set(uint256 x) public {\n        storedData = x;\n    }\n\n    function get() public view returns (uint256) {\n        return storedData;\n    }\n}' },
  { id: 'example2', name: 'Token Example', code: 'pragma solidity ^0.8.0;\n\ncontract Token {\n    mapping(address => uint) public balances;\n    uint public totalSupply;\n\n    constructor(uint _initialSupply) {\n        balances[msg.sender] = totalSupply = _initialSupply;\n    }\n\n    function transfer(address _to, uint _value) public returns (bool) {\n        require(balances[msg.sender] >= _value);\n        balances[msg.sender] -= _value;\n        balances[_to] += _value;\n        return true;\n    }\n}' },
  { id: 'example3', name: 'Vulnerable Reentrancy', code: 'pragma solidity ^0.8.0;\n\ncontract Vulnerable {\n    mapping(address => uint) public balances;\n\n    function deposit() public payable {\n        balances[msg.sender] += msg.value;\n    }\n\n    function withdraw() public {\n        uint amount = balances[msg.sender];\n        (bool success, ) = msg.sender.call{value: amount}("");\n        require(success);\n        balances[msg.sender] = 0;\n    }\n}' }
];

/**
 * API Service for the Hedera Smart Contract Audit AI
 */

// Mock analysis results for testing
const mockAnalysisResults = {
  id: 'analysis123',
  contractName: 'VulnerableToken',
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
}`,
  vulnerabilities: [
    {
      id: 'vuln-1',
      title: 'Integer Underflow in transfer() function',
      severity: 'Critical',
      description: 'The transfer function does not check if the sender has sufficient balance before performing the transfer, which can lead to an integer underflow.',
      recommendation: 'Add a require statement to check the balance before transfer: `require(balanceOf[msg.sender] >= value, "Insufficient balance");`',
      codeSnippet: {
        start: 16,
        end: 19,
        code: 'function transfer(address to, uint256 value) public returns (bool) {\n    // Missing balance check - can cause underflow\n    balanceOf[msg.sender] -= value;\n    balanceOf[to] += value;\n    return true;\n}'
      }
    },
    {
      id: 'vuln-2',
      title: 'Reentrancy Vulnerability',
      severity: 'High',
      description: 'The withdraw function sends ETH before updating the balance, which can lead to reentrancy attacks.',
      recommendation: 'Update the balance before making external calls: Implement the checks-effects-interactions pattern.',
      codeSnippet: {
        start: 22,
        end: 27,
        code: 'function withdraw() public {\n    uint amount = balanceOf[msg.sender];\n    // Reentrancy vulnerability\n    (bool success, ) = msg.sender.call{value: amount}("");\n    require(success);\n    balanceOf[msg.sender] = 0;\n}'
      }
    },
    {
      id: 'vuln-3',
      title: 'Missing Event Emission',
      severity: 'Medium',
      description: 'The contract does not emit events for important state changes like transfers.',
      recommendation: 'Define and emit events for state changes to enable proper off-chain tracking.',
      codeSnippet: {
        start: 16,
        end: 19,
        code: 'function transfer(address to, uint256 value) public returns (bool) {\n    // Missing balance check - can cause underflow\n    balanceOf[msg.sender] -= value;\n    balanceOf[to] += value;\n    return true;\n}'
      }
    },
    {
      id: 'vuln-4',
      title: 'No Zero-Address Check',
      severity: 'Low',
      description: 'The transfer function does not check if the recipient address is the zero address.',
      recommendation: 'Add a check to prevent transfers to the zero address: `require(to != address(0), "Cannot transfer to zero address");`',
      codeSnippet: {
        start: 16,
        end: 19,
        code: 'function transfer(address to, uint256 value) public returns (bool) {\n    // Missing balance check - can cause underflow\n    balanceOf[msg.sender] -= value;\n    balanceOf[to] += value;\n    return true;\n}'
      }
    },
    {
      id: 'vuln-5',
      title: 'Missing Visibility Specifier in Constructor',
      severity: 'Informational',
      description: 'Although solidity ^0.8.0 sets constructors to public by default, it is good practice to explicitly specify the visibility.',
      recommendation: 'Add an explicit visibility to the constructor, e.g., `constructor() public {`',
      codeSnippet: {
        start: 12,
        end: 14,
        code: 'constructor() {\n    balanceOf[msg.sender] = totalSupply;\n}'
      }
    }
  ],
  reportUrl: '#',
  timestamp: new Date().toISOString()
};

// Mock safe analysis for demonstration
const mockSafeAnalysis = {
  id: 'analysis456',
  contractName: 'SimpleToken',
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
}`,
  vulnerabilities: [], // No vulnerabilities found
  reportUrl: '#',
  timestamp: new Date().toISOString()
};

/**
 * API Service for interacting with the Hedera Smart Contract Audit AI backend
 */
const apiService = {
  /**
   * Get example smart contracts for testing
   * @returns {Promise<Array>} - Array of example contracts
   */
  getExampleContracts: async () => {
    // In a real app, this would fetch from the backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockExamples);
      }, 500); // Simulate network delay
    });
  },

  /**
   * Analyze a smart contract
   * @param {Object} data - Contract data for analysis
   * @param {string} data.contractName - Name of the contract
   * @param {string} data.contractCode - Solidity code
   * @param {boolean} data.checkGasEfficiency - Whether to check for gas optimization
   * @returns {Promise<Object>} - Analysis results
   */
  analyzeContract: async (data) => {
    // In a real app, this would send the data to the backend
    console.log('Analyzing contract:', data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check for common vulnerability patterns in the code
        const hasVulnerabilities = 
          // Missing balance/value checks
          (data.contractCode.includes('balanceOf[msg.sender] -= value') && 
           !data.contractCode.includes('require(balanceOf[msg.sender] >= value')) || 
          // Reentrancy pattern (external call before state change)
          (data.contractCode.includes('call{value:') && 
           data.contractCode.match(/call\{value:.*\}\(.*\)[^]*balanceOf\[.*\]\s*=\s*0/)) || 
          // Missing zero address check
          (data.contractCode.includes('function transfer') && 
           !data.contractCode.includes('require(to != address(0)')) ||
          // Contains 'vulnerable' in name or comments
          data.contractName.toLowerCase().includes('vulnerable') || 
          data.contractCode.toLowerCase().includes('// vulnerable') ||
          data.contractCode.toLowerCase().includes('/* vulnerable');
        
        if (hasVulnerabilities) {
          resolve({
            ...mockAnalysisResults,
            contractName: data.contractName,
            code: data.contractCode
          });
        } else {
          // Return no vulnerabilities for safe contracts
          resolve({
            ...mockSafeAnalysis,
            contractName: data.contractName,
            code: data.contractCode
          });
        }
      }, 2000); // Simulate analysis time
    });
  },

  /**
   * Get analysis results by ID
   * @param {string} id - Analysis ID
   * @returns {Promise<Object>} - Analysis results
   */
  getAnalysisResults: async (id) => {
    // In a real app, this would fetch from the backend
    console.log('Fetching analysis results for ID:', id);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (id === 'invalid-id') {
          reject(new Error('Analysis not found'));
        } else if (id.includes('456') || id === 'safe') {
          resolve(mockSafeAnalysis);
        } else {
          resolve(mockAnalysisResults);
        }
      }, 1000); // Simulate network delay
    });
  }
};

export default apiService; 