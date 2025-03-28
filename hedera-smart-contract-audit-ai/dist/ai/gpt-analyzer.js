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
exports.GPTAnalyzer = void 0;
const openai_1 = __importDefault(require("openai"));
const solidity_parser_1 = require("../utils/solidity-parser");
const logger_1 = require("../utils/logger");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
class GPTAnalyzer {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not found in environment variables');
        }
        this.openai = new openai_1.default({
            apiKey: apiKey
        });
        logger_1.logger.info('GPT AI client initialized successfully');
    }
    /**
     * Analyzes a smart contract using GPT to identify potential vulnerabilities
     */
    async analyzeContract(contract, options = {}) {
        const vulnerabilities = [];
        try {
            // Extract contract components for analysis
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
        }
        catch (error) {
            logger_1.logger.error('Error during AI analysis:', error);
        }
        return vulnerabilities;
    }
    /**
     * Generates a prompt for security analysis
     */
    generateSecurityAnalysisPrompt(contract, functions, stateVariables) {
        return `You are a smart contract security expert. Analyze the following Solidity smart contract for security vulnerabilities, focusing on:
1. Reentrancy vulnerabilities
2. Access control issues
3. Integer overflow/underflow
4. Unchecked external calls
5. Gas limitations
6. Logic errors
7. Missing input validation
8. Hedera-specific security considerations

Contract Name: ${contract.name}
Solidity Version: ${contract.version}

State Variables:
${stateVariables.map(v => `${v.type} ${v.name} (line ${v.line})`).join('\n')}

Contract Code:
${contract.code}

Provide your analysis in the following JSON format:
{
  "vulnerabilities": [
    {
      "name": "Vulnerability name",
      "description": "Detailed description of the vulnerability",
      "severity": "Critical|High|Medium|Low",
      "lineNumbers": [affected line numbers],
      "remediation": "Suggested fix"
    }
  ]
}`;
    }
    /**
     * Generates a prompt for gas efficiency analysis
     */
    generateGasAnalysisPrompt(contract, functions) {
        return `You are a smart contract gas optimization expert. Analyze the following Solidity smart contract for gas efficiency improvements, focusing on:
1. Storage vs Memory usage
2. Loop optimizations
3. Function modifiers
4. Data packing
5. Unnecessary operations
6. Hedera-specific gas considerations

Contract Name: ${contract.name}
Solidity Version: ${contract.version}

Contract Code:
${contract.code}

Provide your analysis in the following JSON format:
{
  "vulnerabilities": [
    {
      "name": "Gas optimization opportunity",
      "description": "Detailed description of the inefficiency",
      "severity": "Low",
      "lineNumbers": [affected line numbers],
      "remediation": "Suggested optimization"
    }
  ]
}`;
    }
    /**
     * Send a prompt to GPT for analysis
     */
    async conductAnalysis(prompt) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a smart contract security expert. Provide analysis in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 2000
            });
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content;
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Error during GPT API call:', error);
            if (error instanceof Error) {
                logger_1.logger.error(error.message);
            }
            return null;
        }
    }
    /**
     * Parse the AI response into structured vulnerability reports
     */
    parseAIResponse(response, contract) {
        try {
            // Extract JSON from response (in case there's additional text)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.vulnerabilities || [];
        }
        catch (error) {
            logger_1.logger.error('Error parsing AI response:', error);
            console.error('Response was:', response);
            return [];
        }
    }
}
exports.GPTAnalyzer = GPTAnalyzer;
//# sourceMappingURL=gpt-analyzer.js.map