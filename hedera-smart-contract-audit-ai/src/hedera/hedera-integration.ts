import { 
  Client, 
  AccountId, 
  PrivateKey, 
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionResponse,
  ContractId,
  FileCreateTransaction,
  FileAppendTransaction,
  FileId,
  ContractCallQuery
} from '@hashgraph/sdk';
import { logger } from '../utils/logger';
import { HederaConfig } from '../types/hedera';

export class HederaIntegration {
  private client: Client;
  private accountId: AccountId;
  private privateKey: PrivateKey;

  constructor(config: HederaConfig) {
    // Initialize Hedera client
    this.client = Client.forTestnet();
    
    // Set up account credentials
    this.accountId = AccountId.fromString(config.accountId);
    this.privateKey = PrivateKey.fromString(config.privateKey);
    
    // Set the operator
    this.client.setOperator(this.accountId, this.privateKey);
  }

  async deployContract(bytecode: string): Promise<ContractId> {
    try {
      // Create a file for the contract bytecode
      const fileCreateTx = new FileCreateTransaction()
        .setKeys([this.privateKey.publicKey])
        .setContents(bytecode)
        .setMaxTransactionFee(new Hbar(2));

      const fileCreateResponse = await fileCreateTx.execute(this.client);
      const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client);
      const fileId = fileCreateReceipt.fileId;

      if (!fileId) {
        throw new Error('Failed to create file for contract bytecode');
      }

      // Create the contract
      const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(fileId)
        .setGas(1000000)
        .setMaxTransactionFee(new Hbar(2));

      const contractCreateResponse = await contractCreateTx.execute(this.client);
      const contractCreateReceipt = await contractCreateResponse.getReceipt(this.client);
      const contractId = contractCreateReceipt.contractId;

      if (!contractId) {
        throw new Error('Failed to create contract');
      }

      logger.info(`Contract deployed successfully with ID: ${contractId}`);
      return contractId;
    } catch (error) {
      logger.error('Error deploying contract:', error);
      throw error;
    }
  }

  async executeContractFunction(
    contractId: ContractId,
    functionName: string,
    params: any[]
  ): Promise<TransactionResponse> {
    try {
      // Create function parameters
      const functionParams = new ContractFunctionParameters();
      for (const param of params) {
        if (typeof param === 'string') {
          functionParams.addString(param);
        } else if (typeof param === 'number') {
          functionParams.addUint256(param);
        } else if (typeof param === 'boolean') {
          functionParams.addBool(param);
        } else {
          throw new Error(`Unsupported parameter type: ${typeof param}`);
        }
      }

      const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction(functionName, functionParams)
        .setMaxTransactionFee(new Hbar(2));

      const response = await contractExecuteTx.execute(this.client);
      logger.info(`Contract function ${functionName} executed successfully`);
      return response;
    } catch (error) {
      logger.error(`Error executing contract function ${functionName}:`, error);
      throw error;
    }
  }

  async getContractBalance(contractId: ContractId): Promise<Hbar> {
    try {
      // Use ContractCallQuery to get contract balance
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000);

      const response = await query.execute(this.client);
      // For balance, we expect a uint256 return type
      const result = response.getResult(['uint256']);
      return new Hbar(result.toString());
    } catch (error) {
      logger.error('Error getting contract balance:', error);
      throw error;
    }
  }

  async getContractInfo(contractId: ContractId): Promise<any> {
    try {
      // Use ContractCallQuery to get contract info
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000);

      const response = await query.execute(this.client);
      return response.getResult(['string']);
    } catch (error) {
      logger.error('Error getting contract info:', error);
      throw error;
    }
  }
} 