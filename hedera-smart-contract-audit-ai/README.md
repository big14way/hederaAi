# Hedera Smart Contract Audit AI

AI-powered security analysis for smart contracts on the Hedera network.

## Project Overview

Hedera Smart Contract Audit AI leverages artificial intelligence to provide comprehensive security analysis of your smart contracts. The tool scans your Solidity code for vulnerabilities, security issues, and gas inefficiencies, helping developers create more secure and efficient contracts.

![Demo Screenshot](https://example.com/screenshot.png)

## Features

- **AI-Powered Security Analysis**: Detect security vulnerabilities using advanced machine learning models
- **Gas Optimization**: Identify inefficient code patterns to reduce transaction costs
- **Detailed Reports**: Get comprehensive vulnerability reports with remediation suggestions
- **Hedera Integration**: Specifically designed for the Hedera network and its unique features

## Hedera Integration

The tool integrates with Hedera in the following ways:

1. **Smart Contract Deployment**: Analyze contracts before deploying them to Hedera
2. **Hedera Token Service (HTS) Compatibility**: Special checks for HTS interactions
3. **Gas Optimization**: Specific optimizations for Hedera's gas model
4. **Hedera Testnet Deployment**: Test contracts securely before mainnet deployment

## Live Demo

A live demo of the application is deployed on Vercel: [https://hedera-smart-contract-audit-ai.vercel.app](https://hedera-smart-contract-audit-ai.vercel.app)

## Project Structure

The project consists of two main components:

- **Frontend**: React-based web interface for submitting contracts and viewing results
- **Backend**: Node.js server with AI integration for contract analysis (in development)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/hedera-smart-contract-audit-ai.git
   cd hedera-smart-contract-audit-ai
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Deployment

### Deploying to Vercel

1. Fork this repository to your GitHub account
2. Sign up for [Vercel](https://vercel.com/) if you haven't already
3. Create a new project on Vercel and connect to your GitHub repository
4. Configure the project with these settings:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Deploy the project

### Deploying Smart Contracts to Hedera Testnet

1. Create a Hedera Testnet account at [portal.hedera.com](https://portal.hedera.com)
2. Use the Hedera SDK to deploy your analyzed smart contracts:
   ```javascript
   const { Client, ContractCreateFlow } = require("@hashgraph/sdk");
   
   // Initialize client with your testnet account
   const client = Client.forTestnet();
   client.setOperator(accountId, privateKey);
   
   // Deploy your contract
   const contractCreateTx = new ContractCreateFlow()
       .setGas(100000)
       .setBytecode(contractBytecode);
   
   const contractCreateSubmit = await contractCreateTx.execute(client);
   const contractCreateRx = await contractCreateSubmit.getReceipt(client);
   
   console.log(`Contract created with ID: ${contractCreateRx.contractId}`);
   ```

## Future Enhancements

1. **Advanced AI Analysis**: Implementing more sophisticated machine learning models
2. **Automated Fixes**: Suggesting code fixes for identified vulnerabilities
3. **Mobile App**: Creating a mobile interface for on-the-go contract analysis
4. **Integration with Developer Tools**: Creating plugins for VS Code and other IDEs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Hedera Hashgraph for their blockchain platform
- Contributors and supporters of this project

---

*For more information, please watch our demonstration video and review our presentation slides.* 