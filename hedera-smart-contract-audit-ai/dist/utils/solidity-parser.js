"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFunctions = extractFunctions;
exports.extractStateVariables = extractStateVariables;
const parser = __importStar(require("@solidity-parser/parser"));
const logger_1 = require("./logger");
/**
 * Extract function declarations from a Solidity contract
 * @param contract The Solidity contract
 * @returns Array of function objects with name, body, and line numbers
 */
function extractFunctions(contract) {
    try {
        const functions = [];
        const ast = parser.parse(contract.code, { loc: true });
        parser.visit(ast, {
            FunctionDefinition: (node) => {
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
    }
    catch (error) {
        logger_1.logger.error('Error parsing functions:', error);
        return [];
    }
}
/**
 * Extract state variables from a Solidity contract
 * @param contract The Solidity contract
 * @returns Array of state variable objects with name, type, and line number
 */
function extractStateVariables(contract) {
    try {
        const variables = [];
        const ast = parser.parse(contract.code, { loc: true });
        parser.visit(ast, {
            StateVariableDeclaration: (node) => {
                if (node.variables && node.variables.length > 0 && node.loc) {
                    node.variables.forEach((variable) => {
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
    }
    catch (error) {
        logger_1.logger.error('Error parsing state variables:', error);
        return [];
    }
}
//# sourceMappingURL=solidity-parser.js.map