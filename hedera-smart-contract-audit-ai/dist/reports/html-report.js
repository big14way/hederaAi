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
exports.generateHTMLReport = generateHTMLReport;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
/**
 * Generate an HTML report for a contract analysis
 * @param contract The analyzed contract
 * @param vulnerabilities The vulnerabilities found
 * @param outputDir The directory to save the report
 * @returns The path to the generated report
 */
async function generateHTMLReport(contract, vulnerabilities, outputDir) {
    try {
        // Calculate severity counts
        const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
        const infoCount = vulnerabilities.filter(v => v.severity === 'Informational').length;
        // Determine overall risk level
        const riskLevel = criticalCount > 0 ? 'High' :
            highCount > 0 ? 'Medium' :
                mediumCount > 0 ? 'Low' :
                    'Minimal';
        // Prepare the HTML content
        let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Audit Report: ${contract.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f9f9f9;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: #fff;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          border-radius: 5px;
        }
        
        h1, h2, h3, h4 {
          color: #0066cc;
        }
        
        .header {
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        
        .risk-high {
          background-color: #ffdddd;
          border-left: 5px solid #d62c1a;
          padding: 10px;
          border-radius: 2px;
        }
        
        .risk-medium {
          background-color: #ffffcc;
          border-left: 5px solid #f1c40f;
          padding: 10px;
          border-radius: 2px;
        }
        
        .risk-low {
          background-color: #ddffdd;
          border-left: 5px solid #2ecc71;
          padding: 10px;
          border-radius: 2px;
        }
        
        .risk-minimal {
          background-color: #e6f2ff;
          border-left: 5px solid #3498db;
          padding: 10px;
          border-radius: 2px;
        }
        
        .summary-card {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 5px;
        }
        
        .summary-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        
        .stat-box {
          padding: 10px 15px;
          border-radius: 3px;
          color: white;
          font-weight: bold;
          text-align: center;
          min-width: 100px;
        }
        
        .critical { background-color: #d62c1a; }
        .high { background-color: #e67e22; }
        .medium { background-color: #f1c40f; color: #333; }
        .low { background-color: #3498db; }
        .info { background-color: #2ecc71; }
        
        .vulnerability {
          margin-bottom: 30px;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
        }
        
        .vulnerability h3 {
          margin-top: 0;
        }
        
        .vulnerability-critical { border-left: 5px solid #d62c1a; }
        .vulnerability-high { border-left: 5px solid #e67e22; }
        .vulnerability-medium { border-left: 5px solid #f1c40f; }
        .vulnerability-low { border-left: 5px solid #3498db; }
        .vulnerability-informational { border-left: 5px solid #2ecc71; }
        
        pre {
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 10px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        
        .affected-code {
          margin-top: 10px;
          margin-bottom: 10px;
        }
        
        .hljs-line {
          display: block;
          line-height: 1.5;
        }
        
        .hljs-line-highlight {
          background-color: rgba(255, 160, 122, 0.3);
        }
        
        .line-number {
          display: inline-block;
          width: 3em;
          padding-right: 1em;
          text-align: right;
          color: #999;
          user-select: none;
        }
        
        .code-snippet {
          margin-top: 20px;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #777;
          font-size: 0.9em;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        
        .tab {
          padding: 10px 20px;
          cursor: pointer;
          border: 1px solid transparent;
          border-bottom: none;
        }
        
        .tab.active {
          border-color: #ddd;
          border-radius: 5px 5px 0 0;
          background-color: white;
          margin-bottom: -1px;
        }
        
        .tab-content {
          display: none;
        }
        
        .tab-content.active {
          display: block;
        }
      </style>
      <script>
        function switchTab(tabId) {
          // Hide all tabs
          const tabContents = document.querySelectorAll('.tab-content');
          tabContents.forEach(tab => {
            tab.classList.remove('active');
          });
          
          // Deactivate all tab buttons
          const tabs = document.querySelectorAll('.tab');
          tabs.forEach(tab => {
            tab.classList.remove('active');
          });
          
          // Show the selected tab
          document.getElementById(tabId).classList.add('active');
          document.querySelector(\`[data-tab="\${tabId}"]\`).classList.add('active');
        }
        
        function highlightLines(lineNumbers, contractCode) {
          if (!lineNumbers || lineNumbers.length === 0) return '';
          
          const lines = contractCode.split('\\n');
          const buffer = 3; // Show 3 lines before and after each affected line
          
          let result = '';
          let lineToHighlight = new Set(lineNumbers.map(n => parseInt(n)));
          
          let linesToShow = new Set();
          lineNumbers.forEach(lineNum => {
            const num = parseInt(lineNum);
            for (let i = Math.max(1, num - buffer); i <= Math.min(lines.length, num + buffer); i++) {
              linesToShow.add(i);
            }
          });
          
          const sortedLines = Array.from(linesToShow).sort((a, b) => a - b);
          
          let lastLine = 0;
          for (let i = 0; i < sortedLines.length; i++) {
            const lineNum = sortedLines[i];
            
            // If there's a gap, add ellipsis
            if (lineNum > lastLine + 1 && lastLine !== 0) {
              result += '<span class="hljs-line"><span class="line-number">...</span>...</span>\\n';
            }
            
            const line = lines[lineNum - 1] || '';
            const lineClass = lineToHighlight.has(lineNum) ? 'hljs-line-highlight' : '';
            result += \`<span class="hljs-line \${lineClass}"><span class="line-number">\${lineNum}</span>\${line}</span>\\n\`;
            
            lastLine = lineNum;
          }
          
          return result;
        }
      </script>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hedera Smart Contract Security Audit</h1>
          <h2>${contract.name}</h2>
          <p><strong>Version:</strong> ${contract.version}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary-card risk-${riskLevel.toLowerCase()}">
          <h2>Risk Assessment: ${riskLevel}</h2>
          <p>This contract has been analyzed for security vulnerabilities and code quality issues.</p>
          
          <div class="summary-stats">
            <div class="stat-box critical">${criticalCount} Critical</div>
            <div class="stat-box high">${highCount} High</div>
            <div class="stat-box medium">${mediumCount} Medium</div>
            <div class="stat-box low">${lowCount} Low</div>
            <div class="stat-box info">${infoCount} Info</div>
          </div>
        </div>
        
        <div class="tabs">
          <div class="tab active" data-tab="vulnerabilities" onclick="switchTab('vulnerabilities')">Vulnerabilities</div>
          <div class="tab" data-tab="code" onclick="switchTab('code')">Contract Code</div>
        </div>
        
        <div id="vulnerabilities" class="tab-content active">
    `;
        // Group vulnerabilities by severity
        const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
        severities.forEach(severity => {
            const vulns = vulnerabilities.filter(v => v.severity === severity);
            if (vulns.length > 0) {
                html += `<h2>${severity} Severity Findings (${vulns.length})</h2>`;
                vulns.forEach((vuln, index) => {
                    html += `
          <div class="vulnerability vulnerability-${severity.toLowerCase()}">
            <h3>[${index + 1}] ${vuln.name}</h3>
            <p><strong>Description:</strong> ${vuln.description}</p>
            <p><strong>Affected Lines:</strong> ${vuln.lineNumbers?.join(', ') || 'N/A'}</p>
            <p><strong>Remediation:</strong> ${vuln.remediation}</p>
            
            <div class="affected-code">
              <h4>Affected Code:</h4>
              <pre><code class="language-solidity" id="code-${vuln.id}"></code></pre>
              <script>
                document.getElementById('code-${vuln.id}').innerHTML = highlightLines(${JSON.stringify(vuln.lineNumbers)}, ${JSON.stringify(contract.code)});
              </script>
            </div>
          </div>
          `;
                });
            }
        });
        // No vulnerabilities message
        if (vulnerabilities.length === 0) {
            html += `
      <div class="vulnerability vulnerability-low">
        <h3>No vulnerabilities found</h3>
        <p>The analysis did not identify any security issues in this contract. However, this does not guarantee that the contract is free from vulnerabilities.</p>
      </div>
      `;
        }
        // Add the full contract code tab
        html += `
        </div>
        
        <div id="code" class="tab-content">
          <h2>Complete Contract Code</h2>
          <pre><code class="language-solidity">${highlightSolidity(contract.code)}</code></pre>
        </div>
        
        <div class="footer">
          <p>Generated by Hedera Smart Contract Audit AI on ${new Date().toLocaleString()}</p>
          <p>This report is provided for informational purposes only and does not constitute professional advice.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        // Save the report to a file
        const outputPath = path.join(outputDir, `${contract.name}.html`);
        fs.writeFileSync(outputPath, html);
        return outputPath;
    }
    catch (error) {
        logger_1.logger.error('Error generating HTML report:', error);
        throw error;
    }
}
/**
 * Highlight Solidity code using highlight.js
 */
function highlightSolidity(code) {
    try {
        // Simple HTML escaping
        const escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        // Add line numbers
        const lines = escaped.split('\n');
        let result = '';
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            result += `<span class="hljs-line"><span class="line-number">${lineNumber}</span>${line}</span>\n`;
        });
        return result;
    }
    catch (error) {
        logger_1.logger.error('Error highlighting code:', error);
        return code; // Return the original code if highlighting fails
    }
}
//# sourceMappingURL=html-report.js.map