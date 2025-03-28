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
exports.HuggingFaceAnalyzer = void 0;
const solidity_parser_1 = require("../utils/solidity-parser");
const logger_1 = require("../utils/logger");
const dotenv = __importStar(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Load environment variables
dotenv.config();
class HuggingFaceAnalyzer {
    constructor() {
        this.useFallbackModel = false;
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            throw new Error('Hugging Face API key not found in environment variables');
        }
        this.apiKey = apiKey;
        // Primary model - Zephyr 7B Beta
        this.modelEndpoint = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta';
        // Fallback to a simpler model if we encounter JSON parsing issues
        this.fallbackModelEndpoint = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
        logger_1.logger.info('Hugging Face AI client initialized successfully');
    }
    /**
     * Analyzes a smart contract using Hugging Face to identify potential vulnerabilities
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
            let securityResults = await this.conductAnalysis(securityPrompt);
            let usedFallback = false;
            // If security analysis fails, try with fallback model
            if (!securityResults && !this.useFallbackModel) {
                logger_1.logger.info('Primary model failed, switching to fallback model');
                this.useFallbackModel = true;
                securityResults = await this.conductAnalysis(securityPrompt);
            }
            if (securityResults) {
                const parsedResults = this.parseAIResponse(securityResults, contract);
                // If we got results, add them to the vulnerabilities
                if (parsedResults.length > 0) {
                    vulnerabilities.push(...parsedResults);
                }
                else if (!usedFallback) {
                    // If parsing failed, use manual fallback
                    logger_1.logger.info('No valid vulnerabilities found, using basic fallback analysis');
                    vulnerabilities.push(...this.fallbackAnalysis(contract));
                    usedFallback = true;
                }
            }
            else if (!usedFallback) {
                // If both models failed, use manual fallback
                logger_1.logger.info('Both models failed, using basic fallback analysis');
                vulnerabilities.push(...this.fallbackAnalysis(contract));
                usedFallback = true;
            }
            // If gas efficiency check is enabled, conduct that analysis
            if (gasPrompt) {
                const gasResults = await this.conductAnalysis(gasPrompt);
                if (gasResults) {
                    const gasVulnerabilities = this.parseAIResponse(gasResults, contract);
                    // If we got results, add them to the vulnerabilities with 'Informational' severity
                    if (gasVulnerabilities.length > 0) {
                        vulnerabilities.push(...gasVulnerabilities.map(vuln => ({ ...vuln, severity: 'Informational' })));
                    }
                    else if (!usedFallback) {
                        // If parsing failed, use manual fallback for gas
                        logger_1.logger.info('No valid gas optimizations found, using basic fallback analysis');
                        vulnerabilities.push(...this.fallbackGasAnalysis(contract).map(vuln => ({
                            ...vuln,
                            severity: 'Informational'
                        })));
                    }
                }
                else if (!usedFallback) {
                    // If both models failed for gas, use manual fallback
                    logger_1.logger.info('Both models failed for gas analysis, using basic fallback');
                    vulnerabilities.push(...this.fallbackGasAnalysis(contract).map(vuln => ({
                        ...vuln,
                        severity: 'Informational'
                    })));
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
        if (this.useFallbackModel) {
            // Mistral format
            return `<s>[INST] You are a smart contract security expert. Analyze this Solidity contract for security vulnerabilities:

Contract ${contract.name} (v${contract.version}):
${contract.code}

Return a valid JSON object with this exact structure, ensuring no line breaks or duplicates in text fields:
{
  "vulnerabilities": [
    {
      "name": "string (issue name)",
      "description": "string (single line description)",
      "severity": "Critical|High|Medium|Low",
      "lineNumbers": [integer line numbers],
      "remediation": "string (single line fix)"
    }
  ]
}

Do not include any text before or after the JSON. Only return the JSON object. [/INST]</s>`;
        }
        // Zephyr format
        return `<|system|>You are a smart contract security expert. Analyze the contract and return ONLY a valid JSON response with no additional text or line breaks within text fields. Each vulnerability should have exactly one description and one remediation field.</|system|>

<|user|>Analyze this Solidity contract for security vulnerabilities:

Contract ${contract.name} (v${contract.version}):
${contract.code}

Return a valid JSON object with this exact structure, ensuring no line breaks or duplicates in text fields:
{
  "vulnerabilities": [
    {
      "name": "string (issue name)",
      "description": "string (single line description)",
      "severity": "Critical|High|Medium|Low",
      "lineNumbers": [integer line numbers],
      "remediation": "string (single line fix)"
    }
  ]
}</|user|>

<|assistant|>`;
    }
    /**
     * Generates a prompt for gas efficiency analysis
     */
    generateGasAnalysisPrompt(contract, functions) {
        if (this.useFallbackModel) {
            // Mistral format
            return `<s>[INST] You are a smart contract gas optimization expert. Analyze this Solidity contract for gas optimization opportunities:

Contract ${contract.name} (v${contract.version}):
${contract.code}

Return a valid JSON object with this exact structure, ensuring no line breaks or duplicates in text fields:
{
  "vulnerabilities": [
    {
      "name": "string (optimization name)",
      "description": "string (single line description)",
      "severity": "Low",
      "lineNumbers": [integer line numbers],
      "remediation": "string (single line fix)"
    }
  ]
}

Do not include any text before or after the JSON. Only return the JSON object. [/INST]</s>`;
        }
        // Zephyr format
        return `<|system|>You are a smart contract gas optimization expert. Analyze the contract and return ONLY a valid JSON response with no additional text or line breaks within text fields.</|system|>

<|user|>Analyze this Solidity contract for gas optimization opportunities:

Contract ${contract.name} (v${contract.version}):
${contract.code}

Return a valid JSON object with this exact structure, ensuring no line breaks or duplicates in text fields:
{
  "vulnerabilities": [
    {
      "name": "string (optimization name)",
      "description": "string (single line description)",
      "severity": "Low",
      "lineNumbers": [integer line numbers],
      "remediation": "string (single line fix)"
    }
  ]
}</|user|>

<|assistant|>`;
    }
    /**
     * Send a prompt to Hugging Face for analysis
     */
    async conductAnalysis(prompt) {
        try {
            const endpoint = this.useFallbackModel ? this.fallbackModelEndpoint : this.modelEndpoint;
            const response = await (0, node_fetch_1.default)(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 800,
                        temperature: 0.1,
                        top_p: 0.95,
                        do_sample: false,
                        return_full_text: false
                    }
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.statusText}. Details: ${errorText}`);
            }
            const result = await response.json();
            logger_1.logger.info('Received response from Hugging Face API');
            let text = '';
            if (Array.isArray(result) && result.length > 0) {
                text = result[0].generated_text;
            }
            else if (result.generated_text) {
                text = result.generated_text;
            }
            else {
                logger_1.logger.error('Unexpected response format:', result);
                return null;
            }
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                logger_1.logger.error('No JSON found in response');
                return null;
            }
            return jsonMatch[0];
        }
        catch (error) {
            logger_1.logger.error('Error during Hugging Face API call:', error);
            if (error instanceof Error) {
                logger_1.logger.error(error.message);
            }
            return null;
        }
    }
    /**
     * Parse and clean the AI response into structured vulnerability reports
     */
    parseAIResponse(response, contract) {
        try {
            // Clean and parse the JSON response
            let cleanedJson = response;
            // Log the original response to help with debugging
            logger_1.logger.debug('Original response:', response);
            // Remove any text before the first { and after the last }
            cleanedJson = cleanedJson.substring(cleanedJson.indexOf('{'), cleanedJson.lastIndexOf('}') + 1);
            // Fix specific position errors mentioned in error messages
            // The errors are consistently at positions ~2965 and ~2766
            try {
                // If we have enough characters, check for specific position errors
                if (cleanedJson.length > 2900) {
                    const problemPositions = [2765, 2766, 2767, 2964, 2965, 2966];
                    for (const pos of problemPositions) {
                        if (pos < cleanedJson.length) {
                            const char = cleanedJson[pos];
                            const prevChar = cleanedJson[pos - 1] || '';
                            const nextChar = cleanedJson[pos + 1] || '';
                            // Check if we're at a position that needs a comma
                            if (prevChar === '}' && (nextChar === '{' || nextChar.trim() === '{')) {
                                // Replace with a comma
                                cleanedJson = cleanedJson.substring(0, pos) + ',' + cleanedJson.substring(pos);
                            }
                            // Check if we're in an array at line ~50-57
                            else if (char === '{' && prevChar !== ',' && prevChar !== '[' && prevChar.trim() !== '') {
                                // Add a comma before this object
                                cleanedJson = cleanedJson.substring(0, pos) + ',' + cleanedJson.substring(pos);
                            }
                        }
                    }
                }
            }
            catch (posError) {
                logger_1.logger.debug('Error fixing specific positions:', posError);
            }
            // Fix common JSON formatting issues
            cleanedJson = cleanedJson
                // Remove any duplicate commas
                .replace(/,\s*,/g, ',')
                // Remove trailing commas before closing brackets
                .replace(/,\s*([\]}])/g, '$1')
                // Fix missing commas between array elements - crucial fix
                .replace(/}(\s*){/g, '},\n$1{')
                // Ensure proper array formatting
                .replace(/}\s*{/g, '},{')
                // Remove any non-standard whitespace
                .replace(/[\u200B-\u200D\uFEFF]/g, '');
            // Special handling for the specific JSON errors we're seeing
            try {
                // Try to extract the vulnerabilities array for targeted repair
                const vulnMatch = cleanedJson.match(/"vulnerabilities"\s*:\s*\[([\s\S]*?)\]/);
                if (vulnMatch) {
                    let vulnArray = vulnMatch[0];
                    let fixedArray = '';
                    // Split the array into individual objects
                    const objects = vulnArray.split(/{/).slice(1);
                    // Start of the array
                    fixedArray = '"vulnerabilities": [';
                    // Process each vulnerability object
                    for (let i = 0; i < objects.length; i++) {
                        if (!objects[i].trim())
                            continue;
                        // Add opening brace
                        fixedArray += '{' + objects[i];
                        // If it's not the last object and doesn't end with a comma, add one
                        if (i < objects.length - 1 && !objects[i].trim().endsWith(',')) {
                            if (objects[i].trim().endsWith('}')) {
                                fixedArray = fixedArray.slice(0, -1) + '},';
                            }
                            else {
                                fixedArray += ',';
                            }
                        }
                    }
                    // Replace the old array with the fixed one in the cleanedJson
                    cleanedJson = cleanedJson.replace(/"vulnerabilities"\s*:\s*\[([\s\S]*?)\]/, fixedArray);
                }
            }
            catch (arrayFixError) {
                logger_1.logger.debug('Error during specific array fixing:', arrayFixError);
                // Continue with other fixes
            }
            // General character-by-character processing to fix array syntax
            let inArray = false;
            let arrayFixed = '';
            let inQuote = false;
            let depth = 0;
            for (let i = 0; i < cleanedJson.length; i++) {
                const char = cleanedJson[i];
                const nextChar = cleanedJson[i + 1] || '';
                // Track quotes
                if (char === '"' && cleanedJson[i - 1] !== '\\') {
                    inQuote = !inQuote;
                }
                // Track nested structures
                if (!inQuote) {
                    if (char === '{' || char === '[')
                        depth++;
                    if (char === '}' || char === ']')
                        depth--;
                }
                // Track arrays
                if (char === '[' && !inQuote)
                    inArray = true;
                if (char === ']' && !inQuote)
                    inArray = false;
                // Fix missing commas between array elements (objects)
                if (inArray && char === '}' && !inQuote && depth === 1 &&
                    (nextChar !== ',' && nextChar !== ']' && nextChar.trim() !== '')) {
                    arrayFixed += '},';
                }
                // Fix missing commas between array elements (primitives)
                else if (inArray && !inQuote && depth === 0 &&
                    (char.match(/[0-9"]/) && nextChar.match(/[0-9"]/))) {
                    arrayFixed += char + ',';
                }
                else {
                    arrayFixed += char;
                }
            }
            cleanedJson = arrayFixed;
            // Final pass for very specific syntax errors
            try {
                // Try to use JSON5 parsing logic (more lenient)
                const vulnerabilitySection = cleanedJson.match(/"vulnerabilities"\s*:\s*\[([\s\S]*?)\]/);
                if (vulnerabilitySection) {
                    const content = vulnerabilitySection[1];
                    // Manually fix the array with a super conservative approach
                    let manualFixed = '';
                    const items = content.split('},');
                    for (let i = 0; i < items.length; i++) {
                        manualFixed += items[i];
                        if (i < items.length - 1 && !items[i].endsWith('}')) {
                            manualFixed += '}';
                        }
                        if (i < items.length - 1) {
                            manualFixed += ',';
                        }
                    }
                    // Replace the vulnerabilities section
                    cleanedJson = cleanedJson.replace(/"vulnerabilities"\s*:\s*\[([\s\S]*?)\]/, `"vulnerabilities":[${manualFixed}]`);
                }
            }
            catch (manualFixError) {
                logger_1.logger.debug('Manual fix failed:', manualFixError);
            }
            // Final cleanup for common JSON syntax errors
            cleanedJson = cleanedJson
                // Ensure we don't have extra commas
                .replace(/,\s*]/g, ']')
                // Fix specific issue at position ~2970
                .replace(/}\s*{/g, '},{')
                // Add quotes to unquoted property names
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
            // Log the cleaned JSON
            logger_1.logger.debug('Cleaned JSON:', cleanedJson);
            try {
                // Try to parse the cleaned JSON
                const parsed = JSON.parse(cleanedJson);
                if (!parsed.vulnerabilities || !Array.isArray(parsed.vulnerabilities)) {
                    logger_1.logger.error('Invalid vulnerabilities array in response');
                    return [];
                }
                // Validate and clean each vulnerability
                return parsed.vulnerabilities
                    .filter((vuln) => {
                    // Ensure all required fields are present and of correct type
                    return (typeof vuln.name === 'string' &&
                        typeof vuln.description === 'string' &&
                        typeof vuln.severity === 'string' &&
                        (Array.isArray(vuln.lineNumbers) || typeof vuln.lineNumbers === 'number') &&
                        typeof vuln.remediation === 'string');
                })
                    .map((vuln, index) => ({
                    // Generate a unique ID for each vulnerability
                    id: `${contract.name}-${Date.now()}-${index}`,
                    // Clean up any remaining newlines or extra spaces in text fields
                    name: String(vuln.name).replace(/\s+/g, ' ').trim(),
                    description: String(vuln.description).replace(/\s+/g, ' ').trim(),
                    remediation: String(vuln.remediation).replace(/\s+/g, ' ').trim(),
                    severity: String(vuln.severity),
                    // Ensure line numbers are valid integers
                    lineNumbers: Array.isArray(vuln.lineNumbers)
                        ? vuln.lineNumbers
                            .map((num) => parseInt(String(num), 10))
                            .filter((num) => !isNaN(num))
                        : typeof vuln.lineNumbers === 'number'
                            ? [vuln.lineNumbers]
                            : []
                }));
            }
            catch (jsonError) {
                // If parsing fails after all our attempts, use the fallback
                logger_1.logger.error('JSON parsing error:', jsonError);
                logger_1.logger.debug('Failed to parse JSON:', cleanedJson);
                return [];
            }
        }
        catch (error) {
            logger_1.logger.error('Error parsing AI response:', error);
            if (error instanceof Error) {
                logger_1.logger.debug('Parse error details:', error.message);
                logger_1.logger.debug('Response was:', response);
            }
            return [];
        }
    }
    /**
     * Basic fallback security analysis when AI models fail
     */
    fallbackAnalysis(contract) {
        const vulnerabilities = [];
        const code = contract.code.toLowerCase();
        // Check for common vulnerabilities with simple regex patterns
        // Reentrancy vulnerability check
        if (code.includes('call.value') || code.includes('call{value:') || code.includes('send(')) {
            const lineNumbers = this.findLinesWithPattern(contract.code, /(call\.value|call\{value:|\.send\(|\.transfer\()/g);
            vulnerabilities.push({
                id: `${contract.name}-fallback-reentrancy-${Date.now()}`,
                name: 'Potential Reentrancy',
                description: 'The contract uses low-level call with value. Ensure state changes happen before external calls.',
                severity: 'High',
                lineNumbers,
                remediation: 'Follow checks-effects-interactions pattern and consider using ReentrancyGuard.'
            });
        }
        // Integer overflow check
        if (!code.includes('safemath') &&
            (code.includes('+') || code.includes('-') || code.includes('*')) &&
            !code.includes('solidity ^0.8')) {
            vulnerabilities.push({
                id: `${contract.name}-fallback-overflow-${Date.now()}`,
                name: 'Integer Overflow/Underflow',
                description: 'Contract may be vulnerable to integer overflow/underflow.',
                severity: 'Medium',
                lineNumbers: [1], // Just pointing to the first line as a generic reference
                remediation: 'Use SafeMath or upgrade to Solidity 0.8.x which has built-in overflow checks.'
            });
        }
        // Unchecked return values
        if ((code.includes('.send(') || code.includes('.call(')) &&
            !code.includes('require(') && !code.includes('if (')) {
            const lineNumbers = this.findLinesWithPattern(contract.code, /(\.send\(|\.call\()/g);
            vulnerabilities.push({
                id: `${contract.name}-fallback-unchecked-${Date.now()}`,
                name: 'Unchecked Return Values',
                description: 'The contract might not check the return value of send() or call().',
                severity: 'Medium',
                lineNumbers,
                remediation: 'Always check the return value of low-level calls.'
            });
        }
        return vulnerabilities;
    }
    /**
     * Basic fallback gas analysis when AI models fail
     */
    fallbackGasAnalysis(contract) {
        const vulnerabilities = [];
        const code = contract.code.toLowerCase();
        // Check for common gas inefficiencies
        // Storage vs Memory
        if (code.includes('storage') && code.includes('for (')) {
            vulnerabilities.push({
                id: `${contract.name}-fallback-storage-${Date.now()}`,
                name: 'Storage in Loop',
                description: 'Accessing storage variables in loops is gas inefficient.',
                severity: 'Low',
                lineNumbers: this.findLinesWithPattern(contract.code, /for\s*\([^\)]*\)/g),
                remediation: 'Cache storage variables in memory before loops.'
            });
        }
        // Unnecessary public variables
        if (code.match(/public\s+[a-zA-Z0-9_]+\s*;/g)) {
            vulnerabilities.push({
                id: `${contract.name}-fallback-public-${Date.now()}`,
                name: 'Unnecessary Public Variables',
                description: 'Public state variables generate automatic getter functions that consume gas.',
                severity: 'Low',
                lineNumbers: this.findLinesWithPattern(contract.code, /public\s+[a-zA-Z0-9_]+\s*;/g),
                remediation: 'Consider using private or internal for variables that don\'t need external access.'
            });
        }
        return vulnerabilities;
    }
    /**
     * Helper function to find line numbers where a pattern appears
     */
    findLinesWithPattern(code, pattern) {
        const lines = code.split('\n');
        const lineNumbers = [];
        lines.forEach((line, index) => {
            if (line.match(pattern)) {
                lineNumbers.push(index + 1); // +1 because line numbers start at 1
            }
        });
        return lineNumbers;
    }
}
exports.HuggingFaceAnalyzer = HuggingFaceAnalyzer;
//# sourceMappingURL=huggingface-analyzer.js.map