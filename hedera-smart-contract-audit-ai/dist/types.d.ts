/**
 * Represents a Solidity smart contract
 */
export interface SolidityContract {
    /** Contract name */
    name: string;
    /** Contract path */
    path: string;
    /** Contract source code */
    code: string;
    /** Solidity version */
    version: string;
}
/**
 * Represents a security vulnerability found in a smart contract
 */
export interface VulnerabilityReport {
    /** Unique identifier for the vulnerability */
    id: string;
    /** Name of the vulnerability */
    name: string;
    /** Description of the vulnerability */
    description: string;
    /** Severity level of the vulnerability */
    severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
    /** Line numbers where the vulnerability occurs */
    lineNumbers: number[];
    /** Suggested remediation for the vulnerability */
    remediation: string;
}
/**
 * Options for smart contract auditing
 */
export interface AuditOptions {
    /** Whether to check for gas efficiency issues */
    checkGasEfficiency?: boolean;
}
