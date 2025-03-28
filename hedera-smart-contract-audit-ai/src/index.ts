import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { analyzeContract } from './analyzers/analyzer';
import { SolidityContract, VulnerabilityReport } from './types';
import { logger } from './utils/logger';
import chalk from 'chalk';
import { generateHTMLReport } from './reports/html-report';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

logger.info('Environment variables loaded');

// Configure the CLI
const program = new Command()
  .name('hedera-smart-contract-audit-ai')
  .description('AI-powered security audit tool for Hedera smart contracts')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a smart contract for security vulnerabilities')
  .argument('<file>', 'Path to the Solidity file')
  .option('-o, --output <directory>', 'Output directory for the report', './reports')
  .option('-g, --gas', 'Check for gas efficiency issues')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (filePath, options) => {
    try {
      // Validate file path
      if (!fs.existsSync(filePath)) {
        logger.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      if (!filePath.endsWith('.sol')) {
        logger.error('Only Solidity (.sol) files are supported');
        process.exit(1);
      }

      // Read the contract file
      const contractCode = fs.readFileSync(filePath, 'utf8');
      const contractName = path.basename(filePath, '.sol');

      logger.info(`Analyzing contract: ${contractName}`);

      // Create the contract object
      const contract: SolidityContract = {
        name: contractName,
        path: filePath,
        code: contractCode,
        version: detectSolidityVersion(contractCode)
      };

      // Analyze the contract
      const vulnerabilities = await analyzeContract(contract, {
        checkGasEfficiency: options.gas || false
      });

      // Print the results
      printResults(contractName, vulnerabilities);
      
      // Generate HTML report if output is specified
      if (options.output) {
        const reportDir = options.output;
        
        // Create the output directory if it doesn't exist
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const reportPath = await generateHTMLReport(contract, vulnerabilities, reportDir);
        logger.info(`HTML report generated: ${reportPath}`);
      }

    } catch (error) {
      logger.error('Error during analysis:', error);
      process.exit(1);
    }
  });

program
  .command('analyze-dir')
  .description('Analyze all smart contracts in a directory')
  .argument('<directory>', 'Path to the directory containing Solidity files')
  .option('-o, --output <directory>', 'Output directory for the report', './reports')
  .option('-g, --gas', 'Check for gas efficiency issues')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (dirPath, options) => {
    try {
      // Validate directory path
      if (!fs.existsSync(dirPath)) {
        logger.error(`Directory not found: ${dirPath}`);
        process.exit(1);
      }

      // Find all Solidity files in the directory
      const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.sol'))
        .map(file => path.join(dirPath, file));

      if (files.length === 0) {
        logger.error('No Solidity files found in the directory');
        process.exit(1);
      }

      logger.info(`Found ${files.length} Solidity files`);

      // Create the output directory if it doesn't exist
      if (options.output) {
        if (!fs.existsSync(options.output)) {
          fs.mkdirSync(options.output, { recursive: true });
        }
      }

      // Analyze each contract
      const allResults: { contract: SolidityContract, vulnerabilities: VulnerabilityReport[] }[] = [];
      
      for (const file of files) {
        const contractCode = fs.readFileSync(file, 'utf8');
        const contractName = path.basename(file, '.sol');

        logger.info(`Analyzing contract: ${contractName}`);

        // Create the contract object
        const contract: SolidityContract = {
          name: contractName,
          path: file,
          code: contractCode,
          version: detectSolidityVersion(contractCode)
        };

        // Analyze the contract
        const vulnerabilities = await analyzeContract(contract, {
          checkGasEfficiency: options.gas || false
        });

        allResults.push({ contract, vulnerabilities });
        
        // Print the results for this contract
        printResults(contractName, vulnerabilities);
      }
      
      // Generate a summary report for all contracts
      if (options.output) {
        const summaryPath = path.join(options.output, 'summary.html');
        fs.writeFileSync(summaryPath, generateSummaryReport(allResults));
        logger.info(`Summary report generated: ${summaryPath}`);
        
        // Generate individual reports
        for (const result of allResults) {
          const reportPath = await generateHTMLReport(
            result.contract, 
            result.vulnerabilities, 
            options.output
          );
          logger.info(`Contract report generated: ${reportPath}`);
        }
      }

    } catch (error) {
      logger.error('Error during analysis:', error);
      process.exit(1);
    }
  });

// Parse command-line arguments
program.parse();

/**
 * Detect the Solidity version from the contract code
 */
function detectSolidityVersion(code: string): string {
  const versionMatch = code.match(/pragma\s+solidity\s+([^;]+)/);
  return versionMatch ? versionMatch[1].trim() : 'unknown';
}

/**
 * Print the analysis results to the console in a readable format
 */
function printResults(contractName: string, vulnerabilities: VulnerabilityReport[]): void {
  const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
  const infoCount = vulnerabilities.filter(v => v.severity === 'Informational').length;
  
  console.log('\n');
  console.log(chalk.bold('🔍 AUDIT RESULTS FOR ') + chalk.bold.blue(contractName));
  console.log('═════════════════════════════════════════════');
  
  // Summary of findings
  console.log(chalk.bold('SUMMARY:'));
  console.log(`Total issues found: ${chalk.bold(vulnerabilities.length)}`);
  if (criticalCount > 0) console.log(`- ${chalk.red.bold('Critical')}: ${criticalCount}`);
  if (highCount > 0) console.log(`- ${chalk.magenta.bold('High')}: ${highCount}`);
  if (mediumCount > 0) console.log(`- ${chalk.yellow.bold('Medium')}: ${mediumCount}`);
  if (lowCount > 0) console.log(`- ${chalk.blue.bold('Low')}: ${lowCount}`);
  if (infoCount > 0) console.log(`- ${chalk.green.bold('Informational')}: ${infoCount}`);
  console.log('─────────────────────────────────────────────');
  
  // Group by severity for better organization
  const groupedBySeverity = {
    Critical: vulnerabilities.filter(v => v.severity === 'Critical'),
    High: vulnerabilities.filter(v => v.severity === 'High'),
    Medium: vulnerabilities.filter(v => v.severity === 'Medium'),
    Low: vulnerabilities.filter(v => v.severity === 'Low'),
    Informational: vulnerabilities.filter(v => v.severity === 'Informational')
  };
  
  // Print details of each finding
  const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
  severities.forEach(severity => {
    const vulns = groupedBySeverity[severity as keyof typeof groupedBySeverity];
    
    if (vulns.length > 0) {
      let color: any;
      switch (severity) {
        case 'Critical': color = chalk.red.bold; break;
        case 'High': color = chalk.magenta.bold; break;
        case 'Medium': color = chalk.yellow.bold; break;
        case 'Low': color = chalk.blue.bold; break;
        case 'Informational': color = chalk.green.bold; break;
      }
      
      console.log(color(`\n${severity.toUpperCase()} SEVERITY ISSUES:`));
      
      vulns.forEach((vuln, index) => {
        console.log(`\n${color(`[${index + 1}] ${vuln.name}`)}`);
        console.log(`Description: ${vuln.description}`);
        console.log(`Affected Lines: ${vuln.lineNumbers?.join(', ') || 'N/A'}`);
        console.log(`Remediation: ${vuln.remediation}`);
      });
    }
  });
  
  if (vulnerabilities.length === 0) {
    console.log(chalk.green.bold('\nNo issues found! 🎉'));
  } else {
    console.log('\n' + chalk.yellow.bold('Review the HTML report for more details'));
  }
  
  console.log('\n═════════════════════════════════════════════\n');
}

/**
 * Generate a summary HTML report for multiple contracts
 */
function generateSummaryReport(results: { contract: SolidityContract, vulnerabilities: VulnerabilityReport[] }[]): string {
  const totalVulnerabilities = results.reduce((sum, result) => sum + result.vulnerabilities.length, 0);
  const criticalCount = results.reduce((sum, result) => 
    sum + result.vulnerabilities.filter(v => v.severity === 'Critical').length, 0);
  const highCount = results.reduce((sum, result) => 
    sum + result.vulnerabilities.filter(v => v.severity === 'High').length, 0);
  const mediumCount = results.reduce((sum, result) => 
    sum + result.vulnerabilities.filter(v => v.severity === 'Medium').length, 0);
  const lowCount = results.reduce((sum, result) => 
    sum + result.vulnerabilities.filter(v => v.severity === 'Low').length, 0);
  const infoCount = results.reduce((sum, result) => 
    sum + result.vulnerabilities.filter(v => v.severity === 'Informational').length, 0);
  
  const riskLevel = criticalCount > 0 ? 'High' : highCount > 0 ? 'Medium' : mediumCount > 0 ? 'Low' : 'Minimal';
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Smart Contract Audit Summary</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      h1, h2, h3 { color: #0066cc; }
      .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .contract { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      .critical { color: #d62c1a; }
      .high { color: #e67e22; }
      .medium { color: #f1c40f; }
      .low { color: #3498db; }
      .info { color: #2ecc71; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
      a { color: #0066cc; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .risk-high { background-color: #ffdddd; }
      .risk-medium { background-color: #ffffcc; }
      .risk-low { background-color: #ddffdd; }
      .risk-minimal { background-color: #e6f2ff; }
    </style>
  </head>
  <body>
    <h1>Smart Contract Audit Summary</h1>
    <div class="summary risk-${riskLevel.toLowerCase()}">
      <h2>Overall Risk Level: ${riskLevel}</h2>
      <p>Total Contracts Analyzed: ${results.length}</p>
      <p>Total Vulnerabilities Found: ${totalVulnerabilities}</p>
      <ul>
        ${criticalCount > 0 ? `<li><span class="critical">Critical: ${criticalCount}</span></li>` : ''}
        ${highCount > 0 ? `<li><span class="high">High: ${highCount}</span></li>` : ''}
        ${mediumCount > 0 ? `<li><span class="medium">Medium: ${mediumCount}</span></li>` : ''}
        ${lowCount > 0 ? `<li><span class="low">Low: ${lowCount}</span></li>` : ''}
        ${infoCount > 0 ? `<li><span class="info">Informational: ${infoCount}</span></li>` : ''}
      </ul>
    </div>
    
    <h2>Contract Analysis</h2>
    <table>
      <tr>
        <th>Contract</th>
        <th>Version</th>
        <th>Critical</th>
        <th>High</th>
        <th>Medium</th>
        <th>Low</th>
        <th>Info</th>
        <th>Details</th>
      </tr>
  `;
  
  results.forEach(result => {
    const contractCriticalCount = result.vulnerabilities.filter(v => v.severity === 'Critical').length;
    const contractHighCount = result.vulnerabilities.filter(v => v.severity === 'High').length;
    const contractMediumCount = result.vulnerabilities.filter(v => v.severity === 'Medium').length;
    const contractLowCount = result.vulnerabilities.filter(v => v.severity === 'Low').length;
    const contractInfoCount = result.vulnerabilities.filter(v => v.severity === 'Informational').length;
    
    html += `
      <tr>
        <td>${result.contract.name}</td>
        <td>${result.contract.version}</td>
        <td class="critical">${contractCriticalCount}</td>
        <td class="high">${contractHighCount}</td>
        <td class="medium">${contractMediumCount}</td>
        <td class="low">${contractLowCount}</td>
        <td class="info">${contractInfoCount}</td>
        <td><a href="./${result.contract.name}.html">View Report</a></td>
      </tr>
    `;
  });
  
  html += `
    </table>
    <footer>
      <p>Generated by Hedera Smart Contract Audit AI on ${new Date().toLocaleString()}</p>
    </footer>
  </body>
  </html>
  `;
  
  return html;
} 