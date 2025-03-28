import { Hbar, TransactionResponse, ContractId } from '@hashgraph/sdk';
import { HederaConfig } from '../types/hedera';
export declare class HederaIntegration {
    private client;
    private accountId;
    private privateKey;
    constructor(config: HederaConfig);
    deployContract(bytecode: string): Promise<ContractId>;
    executeContractFunction(contractId: ContractId, functionName: string, params: any[]): Promise<TransactionResponse>;
    getContractBalance(contractId: ContractId): Promise<Hbar>;
    getContractInfo(contractId: ContractId): Promise<any>;
}
