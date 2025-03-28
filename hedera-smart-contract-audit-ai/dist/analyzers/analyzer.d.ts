import { SolidityContract, VulnerabilityReport, AuditOptions } from '../types';
/**
 * Main entry point for contract analysis
 * @param contract The contract to analyze
 * @param options Analysis options
 * @returns List of identified vulnerabilities
 */
export declare function analyzeContract(contract: SolidityContract, options?: AuditOptions): Promise<VulnerabilityReport[]>;
