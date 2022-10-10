import { BigNumber } from '@ethersproject/bignumber';
import { hethers } from '@hashgraph/hethers';
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  TokenAssociateTransaction,
  Transaction,
  TransactionId,
  TransactionReceipt,
} from '@hashgraph/sdk';
import { ChainId } from '@pangolindex/sdk';
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
}

export interface APITransactionResponse {
  transactions: Array<{
    entity_id: string;
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

class Hedera {
  axios: AxiosInstance;

  constructor() {
    this.axios = BaseAxios.create({ timeout: 60000 });
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
        headers,
        ...config,
      });
      return res?.data;
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  public async getAccountBalance(account: string) {
    try {
      const accountId = hethers.utils.asAccountString(account);

      const response = await this.call<AccountBalanceResponse>({
        baseURL: HEDERA_API_BASE_URL,
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

  public async getMetadata(tokemAddress: string): Promise<HederaTokenMetadata | undefined> {
    try {
      const tokenId = hethers.utils.asAccountString(tokemAddress);

      const tokenInfo = await this.call<TokenResponse>({
        baseURL: HEDERA_API_BASE_URL,
        url: '/api/v1/tokens/' + tokenId,
        method: 'GET',
      });

      const token = {
        id: tokemAddress,
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

  public async getTokenBalance(tokemAddress: string, account?: string) {
    try {
      const tokenId = hethers.utils.asAccountString(tokemAddress);
      const accountId = account ? hethers.utils.asAccountString(account) : '';

      const response = await this.call<TokenBalanceResponse>({
        baseURL: HEDERA_API_BASE_URL,
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
      const accountId = account ? hethers.utils.asAccountString(account) : '';
      const client = Client.forTestnet(); // TODO check here for testnet and mainnet
      const query = new AccountBalanceQuery().setAccountId(accountId);
      const tokens = await query.execute(client);

      const allTokens = JSON.parse(JSON.stringify(tokens));

      return allTokens?.tokens;
    } catch (errr) {
      console.log('errrr', errr);
    }
  }

  public async tokenAssociate(tokemAddress: string, account: string, chainId: ChainId) {
    const tokenId = hethers.utils.asAccountString(tokemAddress);
    const accountId = account ? hethers.utils.asAccountString(account) : '';

    const transaction = new TokenAssociateTransaction();
    const tokenIds: string[] = [tokenId];

    transaction.setTokenIds(tokenIds);
    transaction.setAccountId(accountId);

    const transBytes: Uint8Array = await this.makeBytes(transaction, accountId);

    const res = await hashConnect.sendTransaction(transBytes, accountId);

    //handle response
    const responseData: any = {
      response: res,
      receipt: null,
    };

    if (res.success) responseData.receipt = TransactionReceipt.fromBytes(res.receipt as Uint8Array);

    const receipt = res?.response as TransactionResponse;
    if (res.success) {
      return {
        hash: receipt.transactionId,
        //this variable arer dummy which is actually not usefull for now
        confirmations: 1,
        from: account,
        nonce: 0,
        gasLimit: BigNumber.from(0),
        data: res?.topic,
        value: BigNumber.from(0),
        chainId: chainId,
        wait: async () => {
          return responseData.receipt;
        },
      };
    }
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
      };
    } catch (error) {
      console.log(error);
      return 0;
    }
  }
}

export const hederaFn = new Hedera();
