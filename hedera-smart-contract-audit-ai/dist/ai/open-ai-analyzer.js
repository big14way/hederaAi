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
exports.OpenAIAnalyzer = void 0;
const openai_1 = __importDefault(require("openai"));
const solidity_parser_1 = require("../utils/solidity-parser");
const crypto = __importStar(require("crypto"));
const logger_1 = require("../utils/logger");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
class OpenAIAnalyzer {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not found in environment variables');
        }
        // Initialize OpenAI client with API key directly
        this.openai = new openai_1.default({
            apiKey: apiKey
        });
        logger_1.logger.info('OpenAI client initialized successfully');
    }
    /**
     * Analyzes a smart contract using OpenAI to identify potential vulnerabilities
     */
    async analyzeContractWithAI(contract, options = {}) {
        const vulnerabilities = [];
        // Extract contract components for targeted analysis
        const functions = (0, solidity_parser_1.extractFunctions)(contract);
        const stateVariables = (0, solidity_parser_1.extractStateVariables)(contract);
        // Generate prompts for different aspects of the analysis
        const securityPrompt = this.generateSecurityAnalysisPrompt(contract, functions, stateVariables);
        const gasPrompt = options.checkGasEfficiency
            ? this.generateGasAnalysisPrompt(contract, functions)
            : null;
        // Conduct security analysis
        const securityResults = await this.conductAnalysis(securityPrompt);
        if (securityResults) {
            vulnerabilities.push(...this.parseAIResponse(securityResults, contract));
        }
        // If gas efficiency check is enabled, conduct that analysis
        if (gasPrompt) {
            const gasResults = await this.conductAnalysis(gasPrompt);
            if (gasResults) {
                const gasVulnerabilities = this.parseAIResponse(gasResults, contract)
                    .map(vuln => ({ ...vuln, severity: 'Informational' }));
                vulnerabilities.push(...gasVulnerabilities);
            }
        }
        return vulnerabilities;
    }
    /**
     * Generates a prompt for security analysis
     */
    generateSecurityAnalysisPrompt(contract, functions, stateVariables) {
        return `
As a smart contract security expert, analyze the following Solidity code for security vulnerabilities. 
Focus on reentrancy, integer overflow/underflow, improper access control, and other critical issues specific to Hedera's environment.

CONTRACT NAME: ${contract.name}
SOLIDITY VERSION: ${contract.version}

STATE VARIABLES:
${stateVariables.map(v => `${v.type} ${v.name} (line ${v.line})`).join('\n')}

FULL CONTRACT CODE:
\`\`\`solidity
${contract.code}
\`\`\`

For each vulnerability found, provide:
1. Vulnerability name
2. Description
3. Severity (Critical, High, Medium, Low)
4. Line numbers affected
5. Recommended fix

Format your response as a JSON array like this:
[
  {
    "vulnerabilityName": "Reentrancy Vulnerability",
    "description": "The function X does not follow checks-effects-interactions pattern...",
    "severity": "Critical",
    "lineNumbers": [42, 43, 44],
    "remediation": "Update the code to follow checks-effects-interactions pattern by..."
  }
]

Be specific to Hedera's blockchain environment and focus on real vulnerabilities, not stylistic issues.
`;
    }
    /**
     * Generates a prompt for gas efficiency analysis
     */
    generateGasAnalysisPrompt(contract, functions) {
        return `
As a Solidity optimization expert, analyze the following smart contract for gas efficiency issues, specifically focusing on 
Hedera's gas model which can differ from Ethereum.

CONTRACT NAME: ${contract.name}
SOLIDITY VERSION: ${contract.version}

FULL CONTRACT CODE:
\`\`\`solidity
${contract.code}
\`\`\`

For each gas optimization opportunity, provide:
1. Issue name
2. Description
3. Line numbers affected
4. Recommended optimization
5. Potential gas savings (Low, Medium, High)

Format your response as a JSON array like this:
[
  {
    "vulnerabilityName": "Inefficient Storage Usage",
    "description": "The contract uses multiple storage variables where a struct would be more efficient...",
    "severity": "Low",
    "lineNumbers": [15, 16, 17],
    "remediation": "Group related variables into a struct to save gas during storage operations..."
  }
]

Focus on real gas optimization opportunities specific to the Hedera network.
`;
    }
    /**
     * Send a prompt to OpenAI for analysis
     */
    async conductAnalysis(prompt) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are an expert smart contract auditor specializing in Hedera blockchain." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
            });
            return completion.choices[0]?.message?.content || null;
        }
        catch (error) {
            console.error('Error conducting AI analysis:', error);
            return null;
        }
    }
    /**
     * Parse the AI response into structured vulnerability reports
     */
    parseAIResponse(response, contract) {
        try {
            // Extract JSON from response (in case there's additional text)
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch)
                return [];
            const jsonStr = jsonMatch[0];
            const findings = JSON.parse(jsonStr);
            return findings.map((finding) => ({
                id: crypto.randomUUID(),
                name: finding.vulnerabilityName,
                description: finding.description,
                severity: finding.severity,
                lineNumbers: finding.lineNumbers,
                remediation: finding.remediation
            }));
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            console.error('Response was:', response);
            return [];
        }
    }
}
exports.OpenAIAnalyzer = OpenAIAnalyzer;
//# sourceMappingURL=open-ai-analyzer.js.map