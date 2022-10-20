import { hethers } from '@hashgraph/hethers';
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TokenAssociateTransaction,
  Transaction,
  TransactionId,
} from '@hashgraph/sdk';
import { ChainId, CurrencyAmount, WAVAX } from '@pangolindex/sdk';
import { AxiosInstance, AxiosRequestConfig, default as BaseAxios } from 'axios';
import { hashConnect } from 'src/connectors';
import { HEDERA_API_BASE_URL } from 'src/constants';

export interface HederaTokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export type TokenBalanceResponse = {
  balances: Array<{
    account: string;
    balance: any;
  }>;
};

export interface AccountBalanceResponse {
  balances: Array<{
    account: string;
    balance: any;
    tokens: Array<{
      token_id: string;
      balance: any;
    }>;
  }>;
}

export interface TokenResponse {
  decimals: string;
  deleted: boolean;
  name: string;
  symbol: string;
  token_id: string;
  total_supply: string;
  type: string;
}

export interface TransactionResponse {
  nodeId: string;
  transactionHash: string;
  transactionId: string;
  consensusTimestamp: string;
}

export interface APITransactionResponse {
  transactions: Array<{
    entity_id: string;
    consensus_timestamp: string;
    name: string;
    node: string;
    nonce: number;
    result: string;
    scheduled: boolean;
    transaction_hash: string;
    transaction_id: string;
    transfers: Array<{
      account: string;
      amount: number;
      is_approval: boolean;
    }>;
    valid_duration_seconds: string;
    valid_start_timestamp: string;
  }>;
}

export interface APIBlockResponse {
  blocks: Array<{
    count: number;
    hapi_version: string;
    hash: string;
    name: string;
    number: number;
    previous_hash: string;
    size: number;
    timestamp: {
      from: string;
      to: string;
    };
    gas_used: number;
    logs_bloom: string;
  }>;
}

class Hedera {
  axios: AxiosInstance;
  client: Client;

  constructor() {
    this.axios = BaseAxios.create({ timeout: 60000 });
    this.client = Client.forTestnet(); // TODO check here for testnet and mainnet
  }

  public async makeBytes(transaction: Transaction, accountId: string) {
    const transactionId = TransactionId.generate(accountId);
    transaction.setTransactionId(transactionId);
    transaction.setNodeAccountIds([new AccountId(3)]);

    await transaction.freeze();

    const transBytes = transaction.toBytes();

    return transBytes;
  }

  async call<T>(config: AxiosRequestConfig) {
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const res = await this.axios.request<T>({
        baseURL: HEDERA_API_BASE_URL,
        headers,
        ...config,
      });
      return res?.data;
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  hederaId = (address: string) => {
    return hethers.utils.asAccountString(address);
  };

  contractId = (id: string) => {
    const lastIndex = id.lastIndexOf('.');

    let before = '';
    let after = '';

    if (lastIndex !== -1) {
      before = id.slice(0, lastIndex);
      after = id.slice(lastIndex + 1);
      after = (Number(after) - 1).toString();
    }

    const contractId = before + '.' + after;

    return contractId;
  };

  public async getAccountBalance(account: string) {
    try {
      const accountId = this.hederaId(account);

      const response = await this.call<AccountBalanceResponse>({
        url: `/api/v1/balances?account.id=${accountId}`,
        method: 'GET',
      });

      const balance = response?.balances?.[0]?.balance || 0;
      return balance;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  public async getMetadata(tokenAddress: string): Promise<HederaTokenMetadata | undefined> {
    try {
      const tokenId = this.hederaId(tokenAddress);

      const tokenInfo = await this.call<TokenResponse>({
        url: '/api/v1/tokens/' + tokenId,
        method: 'GET',
      });

      const token = {
        id: tokenAddress,
        name: tokenInfo?.name,
        symbol: tokenInfo?.symbol,
        decimals: Number(tokenInfo?.decimals),
        icon: '',
      };
      return token;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  public async getTokenBalance(tokenAddress: string, account?: string) {
    try {
      const tokenId = this.hederaId(tokenAddress);
      const accountId = account ? this.hederaId(account) : '';

      const response = await this.call<TokenBalanceResponse>({
        url: `/api/v1/tokens/${tokenId}/balances?account.id=${accountId}`,
        method: 'GET',
      });

      const tokenBalance = response?.balances?.[0]?.balance || 0;
      return tokenBalance;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  public async getAccountAssociatedTokens(account: string) {
    try {
      const accountId = account ? this.hederaId(account) : '';

      const query = new AccountBalanceQuery().setAccountId(accountId);
      const tokens = await query.execute(this.client);

      const allTokens = JSON.parse(JSON.stringify(tokens));

      return allTokens?.tokens;
    } catch (errr) {
      console.log('errrr', errr);
    }
  }

  public async tokenAssociate(tokenAddress: string, account: string) {
    const tokenId = this.hederaId(tokenAddress);

    const accountId = account ? this.hederaId(account) : '';
    const transaction = new TokenAssociateTransaction();
    const tokenIds: string[] = [tokenId];

    transaction.setTokenIds(tokenIds);
    transaction.setAccountId(accountId);

    const transBytes: Uint8Array = await this.makeBytes(transaction, accountId);

    const res = await hashConnect.sendTransaction(transBytes, accountId);

    return res;
  }

  //Wrap Function
  public async depositAction(amount: CurrencyAmount, account: string, chainId: ChainId) {
    const accountId = account ? this.hederaId(account) : '';
    const tokenId = this.hederaId(WAVAX[chainId].address);

    const contractId = this.contractId(tokenId);
    const transaction = new ContractExecuteTransaction();
    transaction.setContractId(contractId);
    transaction.setGas(1000000);
    transaction.setFunction('deposit');
    transaction.setPayableAmount(Hbar.fromString(amount.toExact()));

    const transBytes: Uint8Array = await this.makeBytes(transaction, accountId);

    const res = await hashConnect.sendTransaction(transBytes, accountId);

    return res;
  }

  //UnWrap Function
  public async withdrawAction(amount: CurrencyAmount, account: string, chainId: ChainId) {
    const accountId = account ? this.hederaId(account) : '';
    const tokenId = this.hederaId(WAVAX[chainId].address);
    const contractId = this.contractId(tokenId);
    const transaction = new ContractExecuteTransaction();
    transaction.setContractId(contractId);
    transaction.setGas(1000000);

    transaction.setFunction('withdraw', new ContractFunctionParameters().addUint256(amount.raw.toString() as any));

    const transBytes: Uint8Array = await this.makeBytes(transaction, accountId);

    const res = await hashConnect.sendTransaction(transBytes, accountId);

    return res;
  }

  public async getTransactionById(transactionId: string) {
    try {
      const response = await this.call<APITransactionResponse>({
        baseURL: HEDERA_API_BASE_URL,
        url: `/api/v1/transactions/${transactionId}`,
        method: 'GET',
      });

      const transaction = response?.transactions?.[0];

      return {
        transactionId: transaction?.transaction_id,
        transactionHash: transaction?.transaction_hash,
        status: transaction?.result === 'SUCCESS' ? 1 : 0,
        from: transaction?.transaction_id?.split('-')[0],
        consensusTimestamp: transaction?.consensus_timestamp,
      };
    } catch (e) {
      console.log(`Transaction ${transactionId} is still in progress or doesn't exist`);
      return null;
    }
  }

  public async getTransactionBlock(timestamp: string) {
    //https://testnet.mirrornode.hedera.com/api/v1/blocks?timestamp=gte:1666177911.828565483&limit=1&order=asc
    const response = await this.call<APIBlockResponse>({
      baseURL: HEDERA_API_BASE_URL,
      url: `/api/v1/blocks?timestamp=gte:${timestamp}&limit=1&order=asc`,
      method: 'GET',
    });

    const block = response?.blocks?.[0];

    return block;
  }

  public async getTransactionLatestBlock() {
    //https://testnet.mirrornode.hedera.com/api/v1/blocks?order=desc&limit=1
    const response = await this.call<APIBlockResponse>({
      baseURL: HEDERA_API_BASE_URL,
      url: `/api/v1/blocks?limit=1&order=desc`,
      method: 'GET',
    });

    const block = response?.blocks?.[0];

    return block?.number;
  }
}

export const hederaFn = new Hedera();
