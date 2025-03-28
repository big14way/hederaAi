import { SolidityContract, VulnerabilityReport } from '../types';
export declare class LocalAnalyzer {
    private rules;
    analyzeContract(contract: SolidityContract): Promise<VulnerabilityReport[]>;
    private findLines;
}
