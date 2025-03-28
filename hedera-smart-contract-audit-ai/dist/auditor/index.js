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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartContractAuditor = void 0;
const solidity_parser_1 = require("../utils/solidity-parser");
const huggingface_analyzer_1 = require("../ai/huggingface-analyzer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
/**
 * Main class for auditing smart contracts
 */
class SmartContractAuditor {
    constructor(options = {}) {
        this.options = {
            checkGasEfficiency: true,
            deepAnalysis: false,
            ...options
        };
        this.aiAnalyzer = new huggingface_analyzer_1.HuggingFaceAnalyzer();
    }
    /**
     * Audit a Solidity smart contract from file
     */
    async auditFile(filePath) {
        try {
            const contractSource = fs.readFileSync(filePath, 'utf8');
            return this.auditSource(contractSource, path.basename(filePath));
        }
        catch (error) {
            throw new Error(`Failed to audit file: ${error.message}`);
        }
    }
    /**
     * Audit a Solidity smart contract from source code
     */
    async auditSource(source, filename = 'Contract') {
        try {
            // Parse contract
            const contracts = (0, solidity_parser_1.parseSoliditySource)(source);
            if (contracts.length === 0) {
                throw new Error('No contract found in source');
            }
            // Use the first contract found (or we could audit all of them)
            const contract = contracts[0];
            console.log(`Auditing contract: ${contract.name}`);
            // Compile the contract
            const compilationOutput = (0, solidity_parser_1.compileSolidity)(contract);
            if (compilationOutput.errors && compilationOutput.errors.length > 0) {
                // Filter out warnings if the contract still compiles
                const errors = compilationOutput.errors.filter(err => err.type === 'Error');
                if (errors.length > 0) {
                    console.error('Compilation errors:', errors);
                    return this.createErrorResult(contract.name, 'Compilation failed: ' + errors[0].message);
                }
            }
            // Analyze the contract with AI
            const vulnerabilities = await this.auditContract(contract);
            // Generate overall risk score
            const riskScore = this.calculateRiskScore(vulnerabilities);
            // Generate audit result
            return {
                contractName: contract.name,
                timestamp: new Date().toISOString(),
                vulnerabilities,
                gasEfficiency: {
                    score: this.calculateGasScore(vulnerabilities),
                    recommendations: this.extractGasRecommendations(vulnerabilities)
                },
                complianceIssues: this.checkCompliance(contract, vulnerabilities),
                overallRiskScore: riskScore,
                summary: this.generateSummary(contract.name, vulnerabilities, riskScore)
            };
        }
        catch (error) {
            console.error('Audit error:', error);
            throw new Error(`Failed to audit contract: ${error.message}`);
        }
    }
    /**
     * Create an error result when auditing fails
     */
    createErrorResult(contractName, errorMessage) {
        return {
            contractName,
            timestamp: new Date().toISOString(),
            vulnerabilities: [{
                    id: 'error-1',
                    name: 'Audit Failed',
                    description: errorMessage,
                    severity: 'Critical'
                }],
            gasEfficiency: {
                score: 0,
                recommendations: []
            },
            complianceIssues: [],
            overallRiskScore: 10, // Maximum risk
            summary: `Audit failed: ${errorMessage}`
        };
    }
    /**
     * Calculate an overall risk score based on vulnerabilities
     */
    calculateRiskScore(vulnerabilities) {
        if (vulnerabilities.length === 0)
            return 0;
        // Assign weights to different severity levels
        const severityWeights = {
            'Critical': 10,
            'High': 7,
            'Medium': 4,
            'Low': 2,
            'Informational': 0.5
        };
        // Calculate weighted sum of vulnerabilities
        const totalWeight = vulnerabilities.reduce((sum, vuln) => {
            return sum + (severityWeights[vuln.severity] || 0);
        }, 0);
        // Normalize to a 0-10 scale with diminishing returns for many small issues
        return Math.min(10, totalWeight / 2);
    }
    /**
     * Calculate a gas efficiency score
     */
    calculateGasScore(vulnerabilities) {
        // Filter for gas-related issues (typically marked as "Informational")
        const gasIssues = vulnerabilities.filter(v => v.severity === 'Informational' ||
            v.name.toLowerCase().includes('gas') ||
            v.description.toLowerCase().includes('gas'));
        // More gas issues = lower score
        return Math.max(0, 10 - gasIssues.length * 2);
    }
    /**
     * Extract gas optimization recommendations
     */
    extractGasRecommendations(vulnerabilities) {
        return vulnerabilities
            .filter(v => v.severity === 'Informational' ||
            v.name.toLowerCase().includes('gas') ||
            v.description.toLowerCase().includes('gas'))
            .map(v => v.remediation || v.description)
            .filter(Boolean);
    }
    /**
     * Check compliance with various standards
     */
    checkCompliance(contract, vulnerabilities) {
        const result = [];
        // Check for Hedera-specific compliance
        const hederaIssues = this.checkHederaCompliance(contract, vulnerabilities);
        if (hederaIssues.length > 0) {
            result.push({
                standard: 'Hedera Best Practices',
                issues: hederaIssues
            });
        }
        // Add other compliance checks as needed (ERC20, ERC721, etc.)
        if (contract.code.includes('ERC20') || contract.code.includes('IERC20')) {
            const erc20Issues = this.checkERC20Compliance(contract, vulnerabilities);
            if (erc20Issues.length > 0) {
                result.push({
                    standard: 'ERC20',
                    issues: erc20Issues
                });
            }
        }
        return result;
    }
    /**
     * Check for Hedera-specific compliance issues
     */
    checkHederaCompliance(contract, vulnerabilities) {
        const issues = [];
        // Check for Hedera-specific issues
        if (contract.code.includes('block.timestamp') && !contract.code.includes('Hedera timestamp')) {
            issues.push('Consider using Hedera timestamp for more precise timing');
        }
        // Check for gas-related issues specific to Hedera
        if (contract.code.includes('gasleft()')) {
            issues.push('Hedera has different gas economics than Ethereum - review gas usage patterns');
        }
        return issues;
    }
    /**
     * Check for ERC20 compliance issues
     */
    checkERC20Compliance(contract, vulnerabilities) {
        const issues = [];
        const requiredFunctions = ['transfer', 'transferFrom', 'approve', 'allowance', 'balanceOf', 'totalSupply'];
        // Check for required functions
        for (const func of requiredFunctions) {
            if (!contract.code.includes(`function ${func}`)) {
                issues.push(`Missing required ERC20 function: ${func}`);
            }
        }
        // Check for events
        if (!contract.code.includes('event Transfer')) {
            issues.push('Missing required ERC20 event: Transfer');
        }
        if (!contract.code.includes('event Approval')) {
            issues.push('Missing required ERC20 event: Approval');
        }
        return issues;
    }
    /**
     * Generate a summary of the audit
     */
    generateSummary(contractName, vulnerabilities, riskScore) {
        const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
        const infoCount = vulnerabilities.filter(v => v.severity === 'Informational').length;
        let riskLevel = 'Low';
        if (riskScore >= 7)
            riskLevel = 'High';
        else if (riskScore >= 4)
            riskLevel = 'Medium';
        return `
Contract "${contractName}" audit completed with overall risk level: ${riskLevel} (${riskScore.toFixed(1)}/10)
Found ${vulnerabilities.length} issues:
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${mediumCount}
- Low: ${lowCount}
- Informational: ${infoCount}
${criticalCount > 0 ? '⚠️ Critical vulnerabilities must be addressed before deployment.' : ''}
`.trim();
    }
    async auditContract(contract) {
        try {
            logger_1.logger.info(`Starting audit for contract: ${contract.name}`);
            return await this.aiAnalyzer.analyzeContract(contract, this.options);
        }
        catch (error) {
            logger_1.logger.error('Error during contract audit:', error);
            throw error;
        }
    }
}
exports.SmartContractAuditor = SmartContractAuditor;
//# sourceMappingURL=index.js.map