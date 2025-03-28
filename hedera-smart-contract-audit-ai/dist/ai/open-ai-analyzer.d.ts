import { SolidityContract, VulnerabilityReport, AuditOptions } from '../types';
export declare class OpenAIAnalyzer {
    private openai;
    constructor();
    /**
     * Analyzes a smart contract using OpenAI to identify potential vulnerabilities
     */
    analyzeContractWithAI(contract: SolidityContract, options?: AuditOptions): Promise<VulnerabilityReport[]>;
    /**
     * Generates a prompt for security analysis
     */
    generateSecurityAnalysisPrompt(contract: SolidityContract, functions: {
        name: string;
        body: string;
        lineStart: number;
        lineEnd: number;
    }[], stateVariables: {
        name: string;
        type: string;
        line: number;
    }[]): string;
    /**
     * Generates a prompt for gas efficiency analysis
     */
    generateGasAnalysisPrompt(contract: SolidityContract, functions: {
        name: string;
        body: string;
        lineStart: number;
        lineEnd: number;
    }[]): string;
    /**
     * Send a prompt to OpenAI for analysis
     */
    conductAnalysis(prompt: string): Promise<string | null>;
    /**
     * Parse the AI response into structured vulnerability reports
     */
    parseAIResponse(response: string, contract: SolidityContract): VulnerabilityReport[];
}
