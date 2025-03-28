declare module 'solc' {
  interface CompilerInput {
    language: string;
    sources: {
      [key: string]: {
        content: string;
      };
    };
    settings: {
      outputSelection: {
        [key: string]: {
          [key: string]: string[];
        };
      };
    };
  }

  interface CompilerOutput {
    contracts: {
      [key: string]: {
        [key: string]: {
          abi: any[];
          evm: {
            bytecode: {
              object: string;
            };
          };
        };
      };
    };
    errors?: Array<{
      type: string;
      message: string;
    }>;
  }

  function compile(input: string | CompilerInput): CompilerOutput;
  export = compile;
} 