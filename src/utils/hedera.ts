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
import { ChainId, CurrencyAmount, WAVAX, Token } from '@pangolindex/sdk';
import { AxiosInstance, AxiosRequestConfig, default as BaseAxios } from 'axios';
import { hashConnect } from 'src/connectors';
import { HEDERA_API_BASE_URL, ROUTER_ADDRESS } from 'src/constants';

export const TRANSACTION_MAX_FEES = {
  APPROVE_HTS: 850000,
  APPROVE_ERC20: 60000,
  PROVIDE_LIQUIDITY: 250000,
  CREATE_POOL: 2300000,
  REMOVE_NATIVE_LIQUIDITY: 1800000,
  REMOVE_LIQUIDITY: 300000,
  BASE_SWAP: 200000,
  EXTRA_SWAP: 100000,
  TOKEN_OUT_EXACT_SWAP: 100000,
  WRAP_HBAR: 60000,
  UNWRAP_WHBAR: 80000,
  TRANSFER_ERC20: 60000,
  STAKE_LP_TOKEN: 230000,
  COLLECT_REWARDS: 300000,
  EXIT_CAMPAIGN: 300000,
};
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

export interface AddLiquidityData {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  tokenAAmount: string;
  tokenBAmount: string;
  tokenAAmountMin: string;
  tokenBAmountMin: string;
  account: string;
  poolExists: boolean;
  deadline: string;
  chainId: ChainId;
}

export interface AddNativeLiquidityData {
  token: Token | undefined;
  tokenAmount: string;
  HBARAmount: string;
  tokenAmountMin: string;
  HBARAmountMin: string;
  account: string;
  poolExists: boolean;
  deadline: string;
  chainId: ChainId;
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

  idToAddress = (tokenId: string) => {
    return hethers.utils.getChecksumAddress(hethers.utils.getAddressFromAccount(tokenId));
  };

  public async getAccountBalance(account: string) {
    try {
      const accountId = this.hederaId(account);

      const response = await this.call<AccountBalanceResponse>({
        url: `/api/v1/balances?account.id=${accountId}`,
        method: 'GET',
      });

      const balance1 = response?.balances?.[0]?.balance || 0;

      console.log('balance1', balance1);

      // return balance;
      // TODO
      const query = new AccountBalanceQuery().setAccountId(accountId);
      const tokens = await query.execute(this.client);

      const allTokens = JSON.parse(JSON.stringify(tokens));
      console.log('allTokens', allTokens);

      const balance = allTokens?.hbars.slice(0, -2);

      console.log('test', Hbar.fromString(balance).toString());

      return balance1;
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
      console.log('allTokens', allTokens);
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

  async addNativeLiquidity(addNativeLiquidityData: AddNativeLiquidityData) {
    const { token, tokenAmount, HBARAmount, tokenAmountMin, HBARAmountMin, account, poolExists, deadline, chainId } =
      addNativeLiquidityData;

    console.log('token', token);
    console.log('tokenAmount', tokenAmount);
    console.log('HBARAmount', HBARAmount);
    console.log('tokenAmountMin', tokenAmountMin);
    console.log('HBARAmountMin', HBARAmountMin);
    console.log('account', account);
    console.log('deadline', deadline);

    console.log('chainId', chainId);

    const tokenAddress = token ? this.hederaId(token?.address) : '';
    console.log('tokenAddress', tokenAddress);
    const accountId = account ? this.hederaId(account) : '';
    console.log('accountId', accountId);
    const contarctId = this.hederaId(ROUTER_ADDRESS[chainId]);
    console.log('contarctId', contarctId);
    const routerId = this.contractId(contarctId);
    console.log('routerId', routerId);
    const maxGas = poolExists ? TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY : TRANSACTION_MAX_FEES.CREATE_POOL;
    console.log('maxGas', maxGas);

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Amount of HBAR we want to provide
      .setPayableAmount(HBARAmount)
      .setFunction(
        'addLiquidityHBAR',
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addUint256(tokenAmount as any)
          .addUint256(tokenAmountMin as any)
          .addUint256(HBARAmountMin as any)
          .addAddress(accountId)
          .addUint256(deadline as any),
      );

    const transBytes: Uint8Array = await this.makeBytes(transaction, accountId);

    const res = await hashConnect.sendTransaction(transBytes, accountId);

    return res;
  }

  public async addLiquidity(addLiquidityData: AddLiquidityData) {
    const {
      tokenA,
      tokenB,
      tokenAAmount,
      tokenBAmount,
      tokenAAmountMin,
      tokenBAmountMin,
      account,
      poolExists,
      deadline,
      chainId,
    } = addLiquidityData;

    console.log('tokenA', tokenA);
    console.log('tokenB', tokenB);
    console.log('tokenAAmount', tokenAAmount);
    console.log('tokenBAmount', tokenBAmount);
    console.log('tokenAAmountMin', tokenAAmountMin);
    console.log('tokenBAmountMin', tokenBAmountMin);
    console.log('account', account);
    console.log('deadline', deadline);
    console.log('chainId', chainId);

    const tokenAId = tokenA ? this.hederaId(tokenA?.address) : '';
    const tokenBId = tokenB ? this.hederaId(tokenB?.address) : '';

    const tokenAAddress = tokenA ? tokenA?.address : '';
    const tokenBAddress = tokenB ? tokenB?.address : '';

    console.log('tokenAId', tokenAId);
    console.log('tokenBId', tokenBId);

    const contractAId = this.contractId(tokenAId);
    const contractBId = this.contractId(tokenBId);

    console.log('contractAId', contractAId);
    console.log('contractBId', contractBId);

    // const tokenAAddress = this.idToAddress(contractAId);
    // const tokenBAddress = this.idToAddress(contractBId);

    const accountId = account ? this.hederaId(account) : '';
    const contarctId = this.hederaId(ROUTER_ADDRESS[chainId]);

    const accountAddress = hethers.utils.getAddressFromAccount(account);

    const maxGas = poolExists ? TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY : TRANSACTION_MAX_FEES.CREATE_POOL;

    console.log('tokenAAddress', tokenAAddress);
    console.log('tokenBAddress', tokenBAddress);
    console.log('accountId', accountId);
    console.log('contarctId', contarctId);
    console.log('tokenBAmount', tokenBAmount);
    console.log('maxGas', maxGas);

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(contarctId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'addLiquidity',
        new ContractFunctionParameters()
          .addAddress(tokenAAddress)
          .addAddress(tokenBAddress)
          .addUint256(tokenAAmount as any)
          .addUint256(tokenBAmount as any)
          .addUint256(tokenAAmountMin as any)
          .addUint256(tokenBAmountMin as any)
          .addAddress(accountAddress)
          .addUint256(deadline as any),
      );

    const transBytes: Uint8Array = await this.makeBytes(transaction, accountId);

    const res = await hashConnect.sendTransaction(transBytes, accountId);
    console.log('res', res);
    return res;
  }
}

export const hederaFn = new Hedera();
