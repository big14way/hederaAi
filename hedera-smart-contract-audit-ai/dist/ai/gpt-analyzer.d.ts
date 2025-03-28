import { SolidityContract, VulnerabilityReport, AuditOptions } from '../types';
export declare class GPTAnalyzer {
    private openai;
    constructor();
    /**
     * Analyzes a smart contract using GPT to identify potential vulnerabilities
     */
    analyzeContract(contract: SolidityContract, options?: AuditOptions): Promise<VulnerabilityReport[]>;
    /**
     * Generates a prompt for security analysis
     */
    private generateSecurityAnalysisPrompt;
    /**
     * Generates a prompt for gas efficiency analysis
     */
    private generateGasAnalysisPrompt;
    /**
     * Send a prompt to GPT for analysis
     */
    private conductAnalysis;
    /**
     * Parse the AI response into structured vulnerability reports
     */
    private parseAIResponse;
}
