import { SolidityContract, AuditResult, AuditOptions, VulnerabilityReport } from '../types';
/**
 * Main class for auditing smart contracts
 */
export declare class SmartContractAuditor {
    private aiAnalyzer;
    private options;
    constructor(options?: AuditOptions);
    /**
     * Audit a Solidity smart contract from file
     */
    auditFile(filePath: string): Promise<AuditResult>;
    /**
     * Audit a Solidity smart contract from source code
     */
    auditSource(source: string, filename?: string): Promise<AuditResult>;
    /**
     * Create an error result when auditing fails
     */
    private createErrorResult;
    /**
     * Calculate an overall risk score based on vulnerabilities
     */
    private calculateRiskScore;
    /**
     * Calculate a gas efficiency score
     */
    private calculateGasScore;
    /**
     * Extract gas optimization recommendations
     */
    private extractGasRecommendations;
    /**
     * Check compliance with various standards
     */
    private checkCompliance;
    /**
     * Check for Hedera-specific compliance issues
     */
    private checkHederaCompliance;
    /**
     * Check for ERC20 compliance issues
     */
    private checkERC20Compliance;
    /**
     * Generate a summary of the audit
     */
    private generateSummary;
    auditContract(contract: SolidityContract): Promise<VulnerabilityReport[]>;
}
