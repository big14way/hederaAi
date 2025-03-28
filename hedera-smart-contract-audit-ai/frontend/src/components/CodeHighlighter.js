import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Component to display code with syntax highlighting
 * 
 * @param {Object} props
 * @param {string} props.code - The code to highlight
 * @param {string} props.language - The programming language (e.g., 'javascript', 'solidity')
 * @param {Array<number>} props.highlightLines - Line numbers to highlight (1-indexed)
 * @param {string} props.fileName - Optional file name to display
 */
export const CodeHighlighter = ({ 
  code, 
  language = 'solidity', 
  highlightLines = [], 
  fileName = null,
  maxHeight = 350,
}) => {
  // Convert 1-indexed line numbers to 0-indexed for the highlighter
  const lineHighlights = highlightLines.map(line => line - 1);
  
  // Generate line highlighting style
  const lineProps = (lineNumber) => {
    const style = { display: 'block' };
    if (lineHighlights.includes(lineNumber)) {
      style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
      style.borderLeft = '3px solid yellow';
      style.paddingLeft = '1em';
    }
    return { style };
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        overflow: 'hidden',
        borderRadius: 1,
      }}
    >
      {fileName && (
        <Box sx={{ 
          p: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {fileName}
          </Typography>
        </Box>
      )}
      <Box sx={{ maxHeight: maxHeight, overflow: 'auto' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{ 
            margin: 0,
            borderRadius: 0,
            fontSize: '0.85rem',
          }}
          lineProps={lineProps}
        >
          {code || '// No code provided'}
        </SyntaxHighlighter>
      </Box>
    </Paper>
  );
}; 