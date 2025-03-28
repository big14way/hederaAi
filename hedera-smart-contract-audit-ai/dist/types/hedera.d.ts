export interface HederaConfig {
    accountId: string;
    privateKey: string;
    network?: 'mainnet' | 'testnet' | 'previewnet';
}
export interface ContractDeploymentResult {
    contractId: string;
    transactionId: string;
    status: string;
}
export interface ContractExecutionResult {
    transactionId: string;
    status: string;
    result?: any;
}
export interface ContractInfo {
    contractId: string;
    accountId: string;
    fileId: string;
    adminKey: string;
    gas: number;
    balance: string;
    createdTimestamp: string;
    memo: string;
}
