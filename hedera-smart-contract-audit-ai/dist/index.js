"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const commander_1 = require("commander");
const analyzer_1 = require("./analyzers/analyzer");
const logger_1 = require("./utils/logger");
const chalk_1 = __importDefault(require("chalk"));
const html_report_1 = require("./reports/html-report");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
logger_1.logger.info('Environment variables loaded');
// Configure the CLI
const program = new commander_1.Command()
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
            logger_1.logger.error(`File not found: ${filePath}`);
            process.exit(1);
        }
        if (!filePath.endsWith('.sol')) {
            logger_1.logger.error('Only Solidity (.sol) files are supported');
            process.exit(1);
        }
        // Read the contract file
        const contractCode = fs.readFileSync(filePath, 'utf8');
        const contractName = path.basename(filePath, '.sol');
        logger_1.logger.info(`Analyzing contract: ${contractName}`);
        // Create the contract object
        const contract = {
            name: contractName,
            path: filePath,
            code: contractCode,
            version: detectSolidityVersion(contractCode)
        };
        // Analyze the contract
        const vulnerabilities = await (0, analyzer_1.analyzeContract)(contract, {
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
            const reportPath = await (0, html_report_1.generateHTMLReport)(contract, vulnerabilities, reportDir);
            logger_1.logger.info(`HTML report generated: ${reportPath}`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error during analysis:', error);
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
            logger_1.logger.error(`Directory not found: ${dirPath}`);
            process.exit(1);
        }
        // Find all Solidity files in the directory
        const files = fs.readdirSync(dirPath)
            .filter(file => file.endsWith('.sol'))
            .map(file => path.join(dirPath, file));
        if (files.length === 0) {
            logger_1.logger.error('No Solidity files found in the directory');
            process.exit(1);
        }
        logger_1.logger.info(`Found ${files.length} Solidity files`);
        // Create the output directory if it doesn't exist
        if (options.output) {
            if (!fs.existsSync(options.output)) {
                fs.mkdirSync(options.output, { recursive: true });
            }
        }
        // Analyze each contract
        const allResults = [];
        for (const file of files) {
            const contractCode = fs.readFileSync(file, 'utf8');
            const contractName = path.basename(file, '.sol');
            logger_1.logger.info(`Analyzing contract: ${contractName}`);
            // Create the contract object
            const contract = {
                name: contractName,
                path: file,
                code: contractCode,
                version: detectSolidityVersion(contractCode)
            };
            // Analyze the contract
            const vulnerabilities = await (0, analyzer_1.analyzeContract)(contract, {
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
            logger_1.logger.info(`Summary report generated: ${summaryPath}`);
            // Generate individual reports
            for (const result of allResults) {
                const reportPath = await (0, html_report_1.generateHTMLReport)(result.contract, result.vulnerabilities, options.output);
                logger_1.logger.info(`Contract report generated: ${reportPath}`);
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Error during analysis:', error);
        process.exit(1);
    }
});
// Parse command-line arguments
program.parse();
/**
 * Detect the Solidity version from the contract code
 */
function detectSolidityVersion(code) {
    const versionMatch = code.match(/pragma\s+solidity\s+([^;]+)/);
    return versionMatch ? versionMatch[1].trim() : 'unknown';
}
/**
 * Print the analysis results to the console in a readable format
 */
function printResults(contractName, vulnerabilities) {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
    const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
    const infoCount = vulnerabilities.filter(v => v.severity === 'Informational').length;
    console.log('\n');
    console.log(chalk_1.default.bold('🔍 AUDIT RESULTS FOR ') + chalk_1.default.bold.blue(contractName));
    console.log('═════════════════════════════════════════════');
    // Summary of findings
    console.log(chalk_1.default.bold('SUMMARY:'));
    console.log(`Total issues found: ${chalk_1.default.bold(vulnerabilities.length)}`);
    if (criticalCount > 0)
        console.log(`- ${chalk_1.default.red.bold('Critical')}: ${criticalCount}`);
    if (highCount > 0)
        console.log(`- ${chalk_1.default.magenta.bold('High')}: ${highCount}`);
    if (mediumCount > 0)
        console.log(`- ${chalk_1.default.yellow.bold('Medium')}: ${mediumCount}`);
    if (lowCount > 0)
        console.log(`- ${chalk_1.default.blue.bold('Low')}: ${lowCount}`);
    if (infoCount > 0)
        console.log(`- ${chalk_1.default.green.bold('Informational')}: ${infoCount}`);
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
        const vulns = groupedBySeverity[severity];
        if (vulns.length > 0) {
            let color;
            switch (severity) {
                case 'Critical':
                    color = chalk_1.default.red.bold;
                    break;
                case 'High':
                    color = chalk_1.default.magenta.bold;
                    break;
                case 'Medium':
                    color = chalk_1.default.yellow.bold;
                    break;
                case 'Low':
                    color = chalk_1.default.blue.bold;
                    break;
                case 'Informational':
                    color = chalk_1.default.green.bold;
                    break;
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
        console.log(chalk_1.default.green.bold('\nNo issues found! 🎉'));
    }
    else {
        console.log('\n' + chalk_1.default.yellow.bold('Review the HTML report for more details'));
    }
    console.log('\n═════════════════════════════════════════════\n');
}
/**
 * Generate a summary HTML report for multiple contracts
 */
function generateSummaryReport(results) {
    const totalVulnerabilities = results.reduce((sum, result) => sum + result.vulnerabilities.length, 0);
    const criticalCount = results.reduce((sum, result) => sum + result.vulnerabilities.filter(v => v.severity === 'Critical').length, 0);
    const highCount = results.reduce((sum, result) => sum + result.vulnerabilities.filter(v => v.severity === 'High').length, 0);
    const mediumCount = results.reduce((sum, result) => sum + result.vulnerabilities.filter(v => v.severity === 'Medium').length, 0);
    const lowCount = results.reduce((sum, result) => sum + result.vulnerabilities.filter(v => v.severity === 'Low').length, 0);
    const infoCount = results.reduce((sum, result) => sum + result.vulnerabilities.filter(v => v.severity === 'Informational').length, 0);
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
//# sourceMappingURL=index.js.map