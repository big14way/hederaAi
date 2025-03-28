import { SolidityContract, VulnerabilityReport } from '../types';
/**
 * Generate an HTML report for a contract analysis
 * @param contract The analyzed contract
 * @param vulnerabilities The vulnerabilities found
 * @param outputDir The directory to save the report
 * @returns The path to the generated report
 */
export declare function generateHTMLReport(contract: SolidityContract, vulnerabilities: VulnerabilityReport[], outputDir: string): Promise<string>;
