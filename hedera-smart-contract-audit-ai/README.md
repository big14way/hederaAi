# Hedera Smart Contract Audit AI

An AI-powered security audit tool for Hedera smart contracts. This tool uses machine learning to identify potential vulnerabilities and gas inefficiencies in Solidity contracts deployed on the Hedera network.

## Features

- **AI-Powered Analysis**: Uses Hugging Face models to identify security issues
- **Gas Efficiency Check**: Identifies potential gas optimization opportunities
- **Multiple Contract Support**: Analyze an entire directory of contracts at once
- **HTML Reports**: Generates detailed HTML reports with highlighted code snippets
- **Fallback Analysis**: Includes pattern-based fallback analysis for reliability

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/hedera-smart-contract-audit-ai.git
cd hedera-smart-contract-audit-ai
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Hugging Face API key:
```
HUGGINGFACE_API_KEY=your_hugging_face_api_key
```

You can get a free API key by signing up at [Hugging Face](https://huggingface.co/).

## Usage

### Analyze a Single Contract

```
npm start analyze /path/to/your/contract.sol
```

Options:
- `-g, --gas`: Enable gas efficiency analysis
- `-o, --output <directory>`: Specify output directory for HTML reports (default: ./reports)
- `-v, --verbose`: Enable verbose logging

### Analyze Multiple Contracts

```
npm start analyze-dir /path/to/contracts/directory
```

This will analyze all `.sol` files in the specified directory and generate individual reports for each contract.

## Output

The tool provides three types of output:

1. **Console Output**: A summary of the findings displayed in the terminal
2. **Individual HTML Reports**: Detailed reports for each contract with highlighted code snippets
3. **Summary Report**: When analyzing multiple contracts, a summary report is generated

## Example

```
npm start analyze ./examples/token.sol --gas
```

This will:
1. Analyze the token.sol contract for security vulnerabilities
2. Check for gas efficiency issues
3. Generate an HTML report in the ./reports directory

## Limitations

- The AI models may produce false positives or miss certain vulnerabilities
- The tool is designed to assist developers, not replace manual code review
- Complex contracts may require more in-depth analysis

## License

MIT 