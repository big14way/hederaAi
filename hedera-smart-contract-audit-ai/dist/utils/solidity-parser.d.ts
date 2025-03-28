import { SolidityContract } from '../types';
/**
 * Extract function declarations from a Solidity contract
 * @param contract The Solidity contract
 * @returns Array of function objects with name, body, and line numbers
 */
export declare function extractFunctions(contract: SolidityContract): {
    name: string;
    body: string;
    lineStart: number;
    lineEnd: number;
}[];
/**
 * Extract state variables from a Solidity contract
 * @param contract The Solidity contract
 * @returns Array of state variable objects with name, type, and line number
 */
export declare function extractStateVariables(contract: SolidityContract): {
    name: string;
    type: string;
    line: number;
}[];
