export interface VulnerabilityReport {
    id: string;
    name: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
    lineNumbers?: number[];
    remediation?: string;
}
export interface AuditResult {
    contractName: string;
    timestamp: string;
    vulnerabilities: VulnerabilityReport[];
    gasEfficiency: {
        score: number;
        recommendations: string[];
    };
    complianceIssues: {
        standard: string;
        issues: string[];
    }[];
    overallRiskScore: number;
    summary: string;
}
export interface SolidityContract {
    name: string;
    code: string;
    version: string;
    abi?: any[];
    bytecode?: string;
}
export interface AuditOptions {
    checkGasEfficiency?: boolean;
    checkCompliance?: string[];
    deepAnalysis?: boolean;
}
export interface CompilerOutput {
    contracts: Record<string, Record<string, any>>;
    sources: Record<string, any>;
    errors?: Array<any>;
}
export interface VulnerabilityDetector {
    name: string;
    description: string;
    detect(contract: SolidityContract, compilerOutput?: CompilerOutput): Promise<VulnerabilityReport[]>;
}
export interface TokenizeResult {
    tokens: string[];
    lineMap: Map<number, number[]>;
}
export interface Vulnerability {
    name: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    lineNumbers?: number[];
    remediation?: string;
}
export interface GasEfficiency {
    recommendations: string[];
    estimatedGas: number;
}
export interface ComplianceIssue {
    standard: string;
    issues: string[];
}
export interface HederaConfig {
    accountId: string;
    privateKey: string;
    network: 'mainnet' | 'testnet' | 'previewnet';
}
