import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { analyzeContract } from './src/analyzers/analyzer';
import { SolidityContract } from './src/types';
import { logger } from './src/utils/logger';
import { generateHTMLReport } from './src/reports/html-report';

// Create Express server
const app = express();
const port = process.env.PORT || 3001;

// Configure middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get example contracts
app.get('/api/examples', (req, res) => {
  try {
    const examplesDir = path.join(__dirname, 'examples');
    const files = fs.readdirSync(examplesDir)
      .filter(file => file.endsWith('.sol'))
      .map(file => {
        const filePath = path.join(examplesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        return {
          name: file,
          path: filePath,
          content
        };
      });
    res.json({ examples: files });
  } catch (error) {
    logger.error('Error fetching examples:', error);
    res.status(500).json({ error: 'Failed to fetch examples' });
  }
});

// Analyze contract endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { name, code, checkGasEfficiency } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    
    // Generate a unique ID for this analysis
    const analysisId = uuidv4();
    const fileName = `${name.replace(/\.sol$/, '')}.sol`;
    
    // Create temporary contract file
    const contractDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(contractDir)) {
      fs.mkdirSync(contractDir, { recursive: true });
    }
    
    const contractPath = path.join(contractDir, fileName);
    fs.writeFileSync(contractPath, code);
    
    // Create contract object
    const contract: SolidityContract = {
      name: path.basename(fileName, '.sol'),
      path: contractPath,
      code,
      version: detectSolidityVersion(code)
    };
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Analyze the contract
    const vulnerabilities = await analyzeContract(contract, {
      checkGasEfficiency: checkGasEfficiency || false
    });
    
    // Generate HTML report
    const reportPath = await generateHTMLReport(contract, vulnerabilities, reportsDir);
    const reportRelativePath = path.relative(__dirname, reportPath).replace(/\\/g, '/');
    
    // Return analysis results
    res.json({
      analysisId,
      contractName: contract.name,
      vulnerabilities,
      reportUrl: `/${reportRelativePath}`
    });
    
    // Clean up temporary file
    fs.unlinkSync(contractPath);
    
  } catch (error) {
    logger.error('Error during analysis:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Detect the Solidity version from the contract code
function detectSolidityVersion(code: string): string {
  const versionMatch = code.match(/pragma\s+solidity\s+([^;]+)/);
  return versionMatch ? versionMatch[1].trim() : 'unknown';
}

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 