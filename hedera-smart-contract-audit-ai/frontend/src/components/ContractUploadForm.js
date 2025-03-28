import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  Button,
  Paper,
  Typography,
  Alert
} from '@mui/material';
import { Editor } from '@monaco-editor/react';
import { isValidSolidityCode, extractContractName } from '../utils/contractUtils';

const defaultEditorOptions = {
  selectOnLineNumbers: true,
  scrollBeyondLastLine: false,
  minimap: { enabled: true },
  folding: true,
  lineNumbersMinChars: 3,
  automaticLayout: true,
  fontSize: 14,
  wordWrap: 'on',
};

/**
 * Form component for uploading and submitting smart contracts for analysis
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {boolean} props.loading - Whether the form is in loading state
 * @param {string} props.initialCode - Initial code to display
 * @param {string} props.initialContractName - Initial contract name
 */
const ContractUploadForm = ({
  onSubmit,
  loading = false,
  initialCode = '',
  initialContractName = '',
}) => {
  const [contractCode, setContractCode] = useState(initialCode);
  const [contractName, setContractName] = useState(initialContractName);
  const [checkGasEfficiency, setCheckGasEfficiency] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [autoNameDetected, setAutoNameDetected] = useState(false);

  // Validate code when it changes
  useEffect(() => {
    const valid = isValidSolidityCode(contractCode);
    setIsValid(valid);
    
    if (!valid && contractCode.trim() !== '') {
      setErrorMessage('The code does not appear to be valid Solidity');
    } else {
      setErrorMessage('');
    }

    // Try to extract contract name if not set manually
    if (valid && (contractName === '' || autoNameDetected)) {
      const name = extractContractName(contractCode);
      if (name) {
        setContractName(name);
        setAutoNameDetected(true);
      }
    }
  }, [contractCode, contractName, autoNameDetected]);

  // Handle contract name change
  const handleContractNameChange = (e) => {
    setContractName(e.target.value);
    setAutoNameDetected(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isValid) {
      setErrorMessage('Please enter valid Solidity code');
      return;
    }
    
    if (!contractName.trim()) {
      setErrorMessage('Please enter a contract name');
      return;
    }
    
    onSubmit({
      contractName,
      contractCode,
      checkGasEfficiency,
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setContractCode(content);
      
      // Extract file name without extension as contract name if not set
      if (contractName === '' || autoNameDetected) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setContractName(fileName);
        setAutoNameDetected(true);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ width: '100%' }}
    >
      <TextField
        label="Contract Name"
        variant="outlined"
        fullWidth
        value={contractName}
        onChange={handleContractNameChange}
        margin="normal"
        disabled={loading}
        required
        error={!contractName.trim() && errorMessage !== ''}
        helperText={!contractName.trim() && errorMessage !== '' ? 'Contract name is required' : ''}
      />

      <Paper 
        variant="outlined" 
        sx={{ 
          mt: 2, 
          mb: 2,
          border: errorMessage ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            px: 2,
            py: 1
          }}
        >
          <Typography variant="subtitle2">
            Solidity Code
          </Typography>
          <Button
            component="label"
            variant="outlined"
            size="small"
            disabled={loading}
          >
            Upload File
            <input
              type="file"
              accept=".sol"
              hidden
              onChange={handleFileUpload}
              disabled={loading}
            />
          </Button>
        </Box>
        
        <Editor
          height="400px"
          defaultLanguage="sol"
          language="sol"
          value={contractCode}
          options={{
            ...defaultEditorOptions,
            readOnly: loading,
          }}
          onChange={(value) => setContractCode(value || '')}
          theme="vs-dark"
        />
      </Paper>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checkGasEfficiency}
              onChange={(e) => setCheckGasEfficiency(e.target.checked)}
              disabled={loading}
              color="primary"
            />
          }
          label="Check for gas optimization opportunities"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !isValid || !contractName.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze Contract'}
        </Button>
      </Box>
    </Box>
  );
};

export default ContractUploadForm; 