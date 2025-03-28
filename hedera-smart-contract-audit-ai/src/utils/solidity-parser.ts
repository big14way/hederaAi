import { SolidityContract } from '../types';
import * as parser from '@solidity-parser/parser';
import { logger } from './logger';

// Define types for the parser nodes
interface Location {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

interface FunctionNode {
  name: string;
  loc?: Location;
  [key: string]: any;
}

interface VariableDeclaration {
  name: string;
  typeName: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface StateVariableNode {
  variables: VariableDeclaration[];
  loc?: Location;
  [key: string]: any;
}

/**
 * Extract function declarations from a Solidity contract
 * @param contract The Solidity contract
 * @returns Array of function objects with name, body, and line numbers
 */
export function extractFunctions(contract: SolidityContract): { name: string, body: string, lineStart: number, lineEnd: number }[] {
  try {
    const functions: { name: string, body: string, lineStart: number, lineEnd: number }[] = [];
    const ast = parser.parse(contract.code, { loc: true });
    
    parser.visit(ast, {
      FunctionDefinition: (node: any) => {
        if (node.name && node.loc) {
          const lineStart = node.loc.start.line;
          const lineEnd = node.loc.end.line;
          
          // Extract the function body from the source code
          const lines = contract.code.split('\n');
          const functionLines = lines.slice(lineStart - 1, lineEnd);
          const body = functionLines.join('\n');
          
          functions.push({
            name: node.name,
            body,
            lineStart,
            lineEnd
          });
        }
      }
    });
    
    return functions;
  } catch (error) {
    logger.error('Error parsing functions:', error);
    return [];
  }
}

/**
 * Extract state variables from a Solidity contract
 * @param contract The Solidity contract
 * @returns Array of state variable objects with name, type, and line number
 */
export function extractStateVariables(contract: SolidityContract): { name: string, type: string, line: number }[] {
  try {
    const variables: { name: string, type: string, line: number }[] = [];
    const ast = parser.parse(contract.code, { loc: true });
    
    parser.visit(ast, {
      StateVariableDeclaration: (node: any) => {
        if (node.variables && node.variables.length > 0 && node.loc) {
          node.variables.forEach((variable: any) => {
            if (variable.name && variable.typeName && variable.typeName.name) {
              variables.push({
                name: variable.name,
                type: variable.typeName.name,
                line: node.loc?.start.line || 0
              });
            }
          });
        }
      }
    });
    
    return variables;
  } catch (error) {
    logger.error('Error parsing state variables:', error);
    return [];
  }
} 