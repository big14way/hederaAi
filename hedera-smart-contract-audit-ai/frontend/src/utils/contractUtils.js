/**
 * Utility functions for smart contract handling
 */

/**
 * Validate if the input is valid Solidity code
 * This is a basic validation that checks for common indicators
 * @param {string} code - The smart contract code to validate
 * @returns {boolean} - Whether the code appears to be valid Solidity
 */
export const isValidSolidityCode = (code) => {
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return false;
  }

  // Check if it contains common Solidity keywords or constructs
  const solidityPatterns = [
    /pragma\s+solidity/i,
    /contract\s+\w+/i,
    /function\s+\w+/i,
    /^\s*(\/\/|\/\*|import)/m,
  ];

  return solidityPatterns.some(pattern => pattern.test(code));
};

/**
 * Extract contract name from Solidity code
 * @param {string} code - The smart contract code
 * @returns {string|null} - The extracted contract name or null if not found
 */
export const extractContractName = (code) => {
  if (!code || typeof code !== 'string') {
    return null;
  }

  // Look for contract declaration
  const contractMatch = code.match(/contract\s+(\w+)[\s{]/);
  if (contractMatch && contractMatch[1]) {
    return contractMatch[1];
  }

  // If no contract name found, look for library or interface
  const libraryMatch = code.match(/library\s+(\w+)[\s{]/);
  if (libraryMatch && libraryMatch[1]) {
    return libraryMatch[1];
  }

  const interfaceMatch = code.match(/interface\s+(\w+)[\s{]/);
  if (interfaceMatch && interfaceMatch[1]) {
    return interfaceMatch[1];
  }

  return null;
};

/**
 * Get the Solidity version from pragma statement
 * @param {string} code - The smart contract code
 * @returns {string|null} - The Solidity version or null if not found
 */
export const getSolidityVersion = (code) => {
  if (!code || typeof code !== 'string') {
    return null;
  }

  const versionMatch = code.match(/pragma\s+solidity\s+(.+?);/);
  if (versionMatch && versionMatch[1]) {
    return versionMatch[1].trim();
  }

  return null;
};

/**
 * Format the contract size in a human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., "12.5 KB")
 */
export const formatContractSize = (bytes) => {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Categorize the severity of findings for display
 * @param {Array} findings - Array of vulnerability findings
 * @returns {Object} - Counts by severity level
 */
export const categorizeFindingsBySeverity = (findings) => {
  if (!Array.isArray(findings)) {
    return {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0,
    };
  }

  return findings.reduce(
    (acc, finding) => {
      const severity = finding.severity || 'Informational';
      if (acc[severity] !== undefined) {
        acc[severity] += 1;
      }
      return acc;
    },
    {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0,
    }
  );
};

/**
 * Get overall risk level based on findings
 * @param {Object} counts - Counts by severity level
 * @returns {string} - Overall risk level
 */
export const getOverallRiskLevel = (counts) => {
  if (counts.Critical > 0) {
    return 'Critical';
  }
  if (counts.High > 0) {
    return 'High';
  }
  if (counts.Medium > 0) {
    return 'Medium';
  }
  if (counts.Low > 0) {
    return 'Low';
  }
  return 'Safe';
};

/**
 * Format timestamp to readable date
 * @param {number|string} timestamp - Unix timestamp or ISO string
 * @returns {string} - Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return 'N/A';
  }

  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Generate a short hash for display 
 * @param {string} hash - The full hash
 * @param {number} length - Desired visible length (default: 8)
 * @returns {string} - Shortened hash (e.g., "3f7e...a1b2")
 */
export const shortenHash = (hash, length = 6) => {
  if (!hash || typeof hash !== 'string' || hash.length < (length * 2 + 3)) {
    return hash || '';
  }
  
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
}; 