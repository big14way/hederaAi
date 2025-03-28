import { SolidityContract, VulnerabilityReport, AuditOptions } from '../types';
export declare class HuggingFaceAnalyzer {
    private apiKey;
    private modelEndpoint;
    private fallbackModelEndpoint;
    private useFallbackModel;
    constructor();
    /**
     * Analyzes a smart contract using Hugging Face to identify potential vulnerabilities
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
     * Send a prompt to Hugging Face for analysis
     */
    private conductAnalysis;
    /**
     * Parse and clean the AI response into structured vulnerability reports
     */
    private parseAIResponse;
    /**
     * Basic fallback security analysis when AI models fail
     */
    private fallbackAnalysis;
    /**
     * Basic fallback gas analysis when AI models fail
     */
    private fallbackGasAnalysis;
    /**
     * Helper function to find line numbers where a pattern appears
     */
    private findLinesWithPattern;
}
