"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeContract = analyzeContract;
const huggingface_analyzer_1 = require("../ai/huggingface-analyzer");
const logger_1 = require("../utils/logger");
/**
 * Main entry point for contract analysis
 * @param contract The contract to analyze
 * @param options Analysis options
 * @returns List of identified vulnerabilities
 */
async function analyzeContract(contract, options = {}) {
    const startTime = Date.now();
    logger_1.logger.info(`Starting analysis of contract: ${contract.name}`);
    try {
        // Initialize AI analyzer
        const huggingFaceAnalyzer = new huggingface_analyzer_1.HuggingFaceAnalyzer();
        // Run analysis
        logger_1.logger.info('Running AI-powered security analysis...');
        const vulnerabilities = await huggingFaceAnalyzer.analyzeContract(contract, options);
        // Log analysis results
        const duration = (Date.now() - startTime) / 1000;
        const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
        const infoCount = vulnerabilities.filter(v => v.severity === 'Informational').length;
        logger_1.logger.info(`Analysis completed in ${duration.toFixed(2)} seconds`);
        logger_1.logger.info(`Found ${vulnerabilities.length} potential issues:`);
        if (criticalCount > 0)
            logger_1.logger.info(`- Critical: ${criticalCount}`);
        if (highCount > 0)
            logger_1.logger.info(`- High: ${highCount}`);
        if (mediumCount > 0)
            logger_1.logger.info(`- Medium: ${mediumCount}`);
        if (lowCount > 0)
            logger_1.logger.info(`- Low: ${lowCount}`);
        if (infoCount > 0)
            logger_1.logger.info(`- Informational: ${infoCount}`);
        return vulnerabilities;
    }
    catch (error) {
        logger_1.logger.error('Error during contract analysis:', error);
        throw error;
    }
}
//# sourceMappingURL=analyzer.js.map