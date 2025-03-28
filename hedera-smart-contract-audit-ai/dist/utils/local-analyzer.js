"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAnalyzer = void 0;
const logger_1 = require("./logger");
class LocalAnalyzer {
    constructor() {
        this.rules = [
            {
                name: 'Reentrancy Check',
                check: (contract) => {
                    const vulnerabilities = [];
                    const code = contract.code.toLowerCase();
                    if (code.includes('.call{value:') && !code.includes('reentrancyguard')) {
                        vulnerabilities.push({
                            name: 'Potential Reentrancy Vulnerability',
                            description: 'Contract uses low-level call with value transfer without ReentrancyGuard protection',
                            severity: 'High',
                            lineNumbers: this.findLines(contract.code, '.call{value:'),
                            remediation: 'Implement OpenZeppelin\'s ReentrancyGuard or use the checks-effects-interactions pattern'
                        });
                    }
                    return vulnerabilities;
                }
            },
            {
                name: 'Access Control Check',
                check: (contract) => {
                    const vulnerabilities = [];
                    const code = contract.code.toLowerCase();
                    if ((code.includes('selfdestruct') || code.includes('self-destruct')) && !code.includes('onlyowner')) {
                        vulnerabilities.push({
                            name: 'Unprotected Self-Destruct',
                            description: 'Contract contains selfdestruct without access control',
                            severity: 'Critical',
                            lineNumbers: this.findLines(contract.code, 'selfdestruct'),
                            remediation: 'Add access control (e.g., onlyOwner modifier) to selfdestruct function'
                        });
                    }
                    return vulnerabilities;
                }
            },
            {
                name: 'Unchecked External Calls',
                check: (contract) => {
                    const vulnerabilities = [];
                    const code = contract.code;
                    const externalCalls = code.match(/\.(call|transfer|send)\{?[^;]*\}?\(/g) || [];
                    for (const call of externalCalls) {
                        if (!code.includes('require(success') && !code.includes('if (!success)')) {
                            vulnerabilities.push({
                                name: 'Unchecked External Call',
                                description: 'External call result is not checked',
                                severity: 'Medium',
                                lineNumbers: this.findLines(contract.code, call),
                                remediation: 'Add success check for external calls'
                            });
                        }
                    }
                    return vulnerabilities;
                }
            },
            {
                name: 'Gas Optimization',
                check: (contract) => {
                    const vulnerabilities = [];
                    const code = contract.code;
                    // Check for uint256 in storage that could be smaller
                    const smallNumbers = code.match(/uint256[^;]*=[^;]*\d+/g) || [];
                    for (const match of smallNumbers) {
                        const value = parseInt(match.match(/\d+/)?.[0] || '0');
                        if (value <= 255) {
                            vulnerabilities.push({
                                name: 'Gas Optimization - Integer Size',
                                description: `uint256 used for small numbers (${value})`,
                                severity: 'Low',
                                lineNumbers: this.findLines(contract.code, match),
                                remediation: 'Consider using uint8 for numbers up to 255'
                            });
                        }
                    }
                    return vulnerabilities;
                }
            }
        ];
    }
    async analyzeContract(contract) {
        logger_1.logger.info(`Starting local analysis for contract: ${contract.name}`);
        const vulnerabilities = [];
        for (const rule of this.rules) {
            try {
                const results = rule.check(contract);
                vulnerabilities.push(...results);
            }
            catch (error) {
                logger_1.logger.error(`Error running rule ${rule.name}:`, error);
            }
        }
        return vulnerabilities;
    }
    findLines(code, pattern) {
        const lines = code.split('\n');
        const lineNumbers = [];
        lines.forEach((line, index) => {
            if (line.includes(pattern)) {
                lineNumbers.push(index + 1);
            }
        });
        return lineNumbers;
    }
}
exports.LocalAnalyzer = LocalAnalyzer;
//# sourceMappingURL=local-analyzer.js.map