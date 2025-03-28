"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaIntegration = void 0;
const sdk_1 = require("@hashgraph/sdk");
const logger_1 = require("../utils/logger");
class HederaIntegration {
    constructor(config) {
        // Initialize Hedera client
        this.client = sdk_1.Client.forTestnet();
        // Set up account credentials
        this.accountId = sdk_1.AccountId.fromString(config.accountId);
        this.privateKey = sdk_1.PrivateKey.fromString(config.privateKey);
        // Set the operator
        this.client.setOperator(this.accountId, this.privateKey);
    }
    async deployContract(bytecode) {
        try {
            // Create a file for the contract bytecode
            const fileCreateTx = new sdk_1.FileCreateTransaction()
                .setKeys([this.privateKey.publicKey])
                .setContents(bytecode)
                .setMaxTransactionFee(new sdk_1.Hbar(2));
            const fileCreateResponse = await fileCreateTx.execute(this.client);
            const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client);
            const fileId = fileCreateReceipt.fileId;
            if (!fileId) {
                throw new Error('Failed to create file for contract bytecode');
            }
            // Create the contract
            const contractCreateTx = new sdk_1.ContractCreateTransaction()
                .setBytecodeFileId(fileId)
                .setGas(1000000)
                .setMaxTransactionFee(new sdk_1.Hbar(2));
            const contractCreateResponse = await contractCreateTx.execute(this.client);
            const contractCreateReceipt = await contractCreateResponse.getReceipt(this.client);
            const contractId = contractCreateReceipt.contractId;
            if (!contractId) {
                throw new Error('Failed to create contract');
            }
            logger_1.logger.info(`Contract deployed successfully with ID: ${contractId}`);
            return contractId;
        }
        catch (error) {
            logger_1.logger.error('Error deploying contract:', error);
            throw error;
        }
    }
    async executeContractFunction(contractId, functionName, params) {
        try {
            // Create function parameters
            const functionParams = new sdk_1.ContractFunctionParameters();
            for (const param of params) {
                if (typeof param === 'string') {
                    functionParams.addString(param);
                }
                else if (typeof param === 'number') {
                    functionParams.addUint256(param);
                }
                else if (typeof param === 'boolean') {
                    functionParams.addBool(param);
                }
                else {
                    throw new Error(`Unsupported parameter type: ${typeof param}`);
                }
            }
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(1000000)
                .setFunction(functionName, functionParams)
                .setMaxTransactionFee(new sdk_1.Hbar(2));
            const response = await contractExecuteTx.execute(this.client);
            logger_1.logger.info(`Contract function ${functionName} executed successfully`);
            return response;
        }
        catch (error) {
            logger_1.logger.error(`Error executing contract function ${functionName}:`, error);
            throw error;
        }
    }
    async getContractBalance(contractId) {
        try {
            // Use ContractCallQuery to get contract balance
            const query = new sdk_1.ContractCallQuery()
                .setContractId(contractId)
                .setGas(100000);
            const response = await query.execute(this.client);
            // For balance, we expect a uint256 return type
            const result = response.getResult(['uint256']);
            return new sdk_1.Hbar(result.toString());
        }
        catch (error) {
            logger_1.logger.error('Error getting contract balance:', error);
            throw error;
        }
    }
    async getContractInfo(contractId) {
        try {
            // Use ContractCallQuery to get contract info
            const query = new sdk_1.ContractCallQuery()
                .setContractId(contractId)
                .setGas(100000);
            const response = await query.execute(this.client);
            return response.getResult(['string']);
        }
        catch (error) {
            logger_1.logger.error('Error getting contract info:', error);
            throw error;
        }
    }
}
exports.HederaIntegration = HederaIntegration;
//# sourceMappingURL=hedera-integration.js.map