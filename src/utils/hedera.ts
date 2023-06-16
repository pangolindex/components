/* eslint-disable max-lines */
import { Contract } from '@ethersproject/contracts';
import { hethers } from '@hashgraph/hethers';
import {
  AccountAllowanceApproveTransaction,
  AccountBalanceQuery,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  HbarUnit,
  TokenAssociateTransaction,
} from '@hashgraph/sdk';
import { CHAINS, ChainId, CurrencyAmount, Fraction, Token, WAVAX } from '@pangolindex/sdk';
import { AxiosInstance, AxiosRequestConfig, default as BaseAxios } from 'axios';
import { hashConnect } from 'src/connectors';
import { PANGOCHEF_ADDRESS, ROUTER_ADDRESS, SAR_STAKING_ADDRESS } from 'src/constants/address';

export const TRANSACTION_MAX_FEES = {
  APPROVE_HTS: 850000,
  APPROVE_ERC20: 60000,
  PROVIDE_LIQUIDITY: 250000,
  CREATE_POOL: 3000000,
  REMOVE_NATIVE_LIQUIDITY: 250000,
  REMOVE_LIQUIDITY: 250000,
  BASE_SWAP: 200000,
  EXTRA_SWAP: 100000,
  TOKEN_OUT_EXACT_SWAP: 100000,
  WRAP_HBAR: 60000,
  UNWRAP_WHBAR: 80000,
  TRANSFER_ERC20: 60000,
  STAKE_LP_TOKEN: 230000,
  COLLECT_REWARDS: 300000,
  WITHDRAW: 300000,
  COMPOUND: 550000,
  NFT_MINT: 800000,
};
export interface HederaTokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  type: string;
  totalSupply: string;
}

export interface HederaAssociateTokensData {
  tokenId: string;
  decimals: number;
  balance: string;
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

export interface NFTInfoResponse {
  nfts: {
    account_id: string;
    create_timestamp: string;
    delegating_spender: any;
    delegated: boolean;
    metadata: string;
    modified_timestamp: string;
    serial_number: number;
    spender: any;
    token_id: string;
  }[];
  links: {
    next: string | null;
  };
}

export type NFTResponse = NFTInfoResponse['nfts'];

interface BaseExchangeRate {
  cent_equivalent: number;
  expiration_time: number;
  hbar_equivalent: number;
}

export interface ExchangeRateResponse {
  current_rate: BaseExchangeRate;
  next_rate: BaseExchangeRate;
  timestamp: string;
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
  deadline: number;
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
  deadline: number;
  chainId: ChainId;
}

export interface SendingApprovalData {
  tokenAddress: string;
  amount: string;
  spender?: string;
  account?: string | null;
}

export interface ContractData {
  admin_key: {
    _type: string;
    key: string;
  };
  auto_renew_account: string;
  auto_renew_period: number;
  contract_id: string;
  created_timestamp: string;
  deleted: boolean;
  evm_address: string;
  expiration_timestamp: string;
  file_id: string;
  max_automatic_token_associations: number;
  memo: string;
  obtainer_id: string;
  permanent_removal: boolean;
  proxy_account_id: string;
  timestamp: {
    from: string;
    to: string;
  };
  bytecode: string;
}

export interface SwapData {
  methodName: string;
  account: string;
  recipient: string;
  tokenInAmount: string;
  tokenOutAmount: string;
  HBARAmount: string | undefined;
  path: string[];
  exactAmountIn: boolean;
  chainId: ChainId;
  deadline: number;
}

export interface RemoveNativeLiquidityData {
  token: Token | undefined;
  liquidityAmount: string;
  tokenAmountMin: string;
  HBARAmountMin: string;
  account: string;
  deadline: number;
  chainId: ChainId;
}

export interface RemoveLiquidityData {
  tokenA: Token | undefined;
  tokenB: Token | undefined;
  liquidityAmount: string;
  tokenAAmountMin: string;
  tokenBAmountMin: string;
  account: string;
  deadline: number;
  chainId: ChainId;
}

export interface StakeOrWithdrawData {
  account: string;
  amount: string;
  poolId: string;
  chainId: ChainId;
  methodName: 'stake' | 'withdraw';
}

export interface ClaimRewardData {
  account: string;
  methodName: string;
  poolId: string;
  chainId: ChainId;
}

export interface SarBaseData {
  positionId: string;
  account: string;
  chainId: ChainId;
  rent: string; // rent in tinybars
}

export interface SarStakeData extends Omit<SarBaseData, 'positionId'> {
  amount: string;
  positionId?: string;
  methodName: 'mint' | 'stake';
}

export interface CompoundData {
  slippage: {
    minPairAmount: string;
    maxPairAmount: string;
  };
  poolId: string;
  methodName: 'compound' | 'compoundTo';
  account: string;
  chainId: ChainId;
  contract: Contract;
}

export type SarUnstakeData = Omit<SarStakeData, 'methodName' | 'positionId'> & { positionId: string };

class Hedera {
  axios: AxiosInstance;

  constructor() {
    this.axios = BaseAxios.create({ timeout: 60000 });
  }

  get client(): Client {
    const chainId = hashConnect.getChainId();
    return chainId === ChainId.HEDERA_MAINNET ? Client.forMainnet() : Client.forTestnet();
  }

  get HEDERA_API_BASE_URL(): string {
    const chainId = hashConnect.getChainId();
    return chainId === ChainId.HEDERA_MAINNET
      ? `https://mainnet-public.mirrornode.hedera.com`
      : `https://testnet.mirrornode.hedera.com`;
  }

  async call<T>(config: AxiosRequestConfig) {
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const res = await this.axios.request<T>({
        baseURL: this.HEDERA_API_BASE_URL,
        headers,
        ...config,
      });
      return res?.data;
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  isHederaChain = (chainId: ChainId) => {
    return chainId === ChainId.HEDERA_TESTNET || chainId === ChainId.HEDERA_MAINNET;
  };

  isHederaIdValid = (hederaId: string): string | false => {
    if (
      hederaId &&
      hederaId?.toLowerCase()?.match(/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/g)
    ) {
      return hederaId;
    } else {
      return false;
    }
  };

  isAddressValid = (address: string): string | false => {
    if (address && hethers.utils.isAddress(address.toLowerCase())) {
      return hethers.utils.getChecksumAddress(address);
    } else {
      return false;
    }
  };

  hederaId = (address: string) => {
    return hethers.utils.asAccountString(address);
  };

  idToAddress = (tokenId: string) => {
    return hethers.utils.getChecksumAddress(hethers.utils.getAddressFromAccount(tokenId));
  };

  tokenToContractId = (id: string) => {
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

  contractToTokenId = (id: string) => {
    const lastIndex = id.lastIndexOf('.');

    let before = '';
    let after = '';

    if (lastIndex !== -1) {
      before = id.slice(0, lastIndex);
      after = id.slice(lastIndex + 1);
      after = (Number(after) + 1).toString();
    }

    const tokenId = before + '.' + after;

    return tokenId;
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
        type: tokenInfo?.type,
        totalSupply: tokenInfo?.total_supply,
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

  public async getAccountAssociatedTokens(account: string): Promise<Array<HederaAssociateTokensData> | undefined> {
    try {
      const accountId = account ? this.hederaId(account) : '';
      const query = new AccountBalanceQuery().setAccountId(accountId);
      const tokens = await query.execute(this.client);

      const allTokens = JSON.parse(JSON.stringify(tokens));

      return allTokens?.tokens as Array<HederaAssociateTokensData>;
    } catch (errr) {
      console.log('errrr', errr);
    }
  }

  public async getExchangeRate() {
    try {
      // "response" is the data from request
      const response = await this.call<ExchangeRateResponse>({
        url: '/api/v1/network/exchangerate',
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error in fetch Exchange Rate: ', error);
      const timestamp = Math.floor(Date.now() / 1000); // timestamp in seconds
      return {
        current_rate: {
          cent_equivalent: 0,
          hbar_equivalent: 0,
          expiration_time: timestamp + 3600, // add 1 hour in timestamp
        },
        next_rate: {
          cent_equivalent: 0,
          hbar_equivalent: 0,
          expiration_time: timestamp + 3600 * 2, // add 2 hours in timestamp
        },
        timestamp: timestamp.toString(),
      } as ExchangeRateResponse;
    }
  }

  public async getNftInfo(address: string | undefined, account: string | null | undefined) {
    if (!address || !account) {
      return [] as NFTResponse;
    }

    const addressId = this.hederaId(address);
    const accountId = this.hederaId(account);

    try {
      // get only last 100 nfts
      // by default the API returns 25 values
      const nfts: NFTResponse = [];
      let url = `/api/v1/tokens/${addressId}/nfts?account.id=${accountId}`;
      for (let index = 0; index < 4; index++) {
        const response = await this.call<NFTInfoResponse>({
          url: url,
          method: 'GET',
        });

        const _nfts = response['nfts'];
        if (_nfts.length > 0) {
          nfts.push(..._nfts);
        }

        // if the "next" field is null, it's because not exist more nfts to get
        if (!!response.links.next) {
          url = response.links.next;
        } else {
          break; // exit from loop if no next nfts exists
        }
      }
      return nfts;
    } catch (error) {
      console.error('Error in fetch NFT info: ', error);
      return [] as NFTResponse;
    }
  }

  public tokenAssociate(tokenAddress: string, account: string) {
    const tokenId = this.hederaId(tokenAddress);

    const accountId = account ? this.hederaId(account) : '';
    const transaction = new TokenAssociateTransaction();
    const tokenIds: string[] = [tokenId];

    transaction.setTokenIds(tokenIds);
    transaction.setAccountId(accountId);

    return hashConnect.sendTransaction(transaction, accountId);
  }

  // Wrap Function
  public depositAction(amount: CurrencyAmount, account: string, chainId: ChainId) {
    const accountId = account ? this.hederaId(account) : '';
    const tokenId = this.hederaId(WAVAX[chainId].address);

    const contractId = this.tokenToContractId(tokenId);
    const transaction = new ContractExecuteTransaction();
    transaction.setContractId(contractId);
    transaction.setGas(1000000);
    transaction.setFunction('deposit');
    transaction.setPayableAmount(Hbar.fromString(amount.toExact()));

    return hashConnect.sendTransaction(transaction, accountId);
  }

  // UnWrap Function
  public withdrawAction(amount: CurrencyAmount, account: string, chainId: ChainId) {
    const accountId = account ? this.hederaId(account) : '';
    const tokenId = this.hederaId(WAVAX[chainId].address);
    const contractId = this.tokenToContractId(tokenId);
    const transaction = new ContractExecuteTransaction();
    transaction.setContractId(contractId);
    transaction.setGas(1000000);

    transaction.setFunction('withdraw', new ContractFunctionParameters().addUint256(amount.raw.toString() as any));

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async getTransactionById(transactionId: string) {
    try {
      const response = await this.call<APITransactionResponse>({
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
      url: `/api/v1/blocks?timestamp=gte:${timestamp}&limit=1&order=asc`,
      method: 'GET',
    });

    const block = response?.blocks?.[0];

    return block;
  }

  public async getTransactionLatestBlock() {
    //https://testnet.mirrornode.hedera.com/api/v1/blocks?order=desc&limit=1
    const response = await this.call<APIBlockResponse>({
      url: `/api/v1/blocks?limit=1&order=desc`,
      method: 'GET',
    });

    const block = response?.blocks?.[0];

    return block?.number;
  }

  createPair(data: { chainId: ChainId; tokenA: Token; tokenB: Token; account: string }) {
    const { chainId, tokenA, tokenB, account } = data;
    const chain = CHAINS[chainId];
    const factoryAddress = chain.contracts?.factory;
    const accountId = this.hederaId(account);

    if (!factoryAddress) return console.warn('factory address is missing');

    const factoryId = this.hederaId(factoryAddress);
    const maxGas = TRANSACTION_MAX_FEES.CREATE_POOL;
    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    const transaction = new ContractExecuteTransaction()
      .setContractId(factoryId)
      .setGas(maxGas)
      .setPayableAmount(Hbar.from(25, HbarUnit.Hbar))
      .setFunction('createPair', new ContractFunctionParameters().addAddress(tokenAAddress).addAddress(tokenBAddress));

    return hashConnect.sendTransaction(transaction, accountId);
  }

  addNativeLiquidity(addNativeLiquidityData: AddNativeLiquidityData) {
    const { token, tokenAmount, HBARAmount, tokenAmountMin, HBARAmountMin, account, poolExists, deadline, chainId } =
      addNativeLiquidityData;

    const tokenAddress = token ? token?.address : '';
    const accountId = account ? this.hederaId(account) : '';
    const contractId = this.hederaId(ROUTER_ADDRESS[chainId]);
    const maxGas = poolExists ? TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY : TRANSACTION_MAX_FEES.CREATE_POOL;

    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(maxGas)
      .setPayableAmount(Hbar.fromString(HBARAmount))
      .setFunction(
        'addLiquidityAVAX',
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addUint256(tokenAmount as any)
          .addUint256(tokenAmountMin as any)
          .addUint256(HBARAmountMin as any)
          .addAddress(account)
          .addUint256(deadline),
      );

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public addLiquidity(addLiquidityData: AddLiquidityData) {
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

    const tokenAAddress = tokenA ? tokenA?.address : '';
    const tokenBAddress = tokenB ? tokenB?.address : '';

    const accountId = account ? this.hederaId(account) : '';
    const contractId = this.hederaId(ROUTER_ADDRESS[chainId]);

    const maxGas = poolExists ? TRANSACTION_MAX_FEES.PROVIDE_LIQUIDITY : TRANSACTION_MAX_FEES.CREATE_POOL;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(contractId)
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
          .addAddress(account)
          .addUint256(deadline),
      );

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public removeNativeLiquidity(removeNativeLiquidityData: RemoveNativeLiquidityData) {
    const { token, liquidityAmount, tokenAmountMin, HBARAmountMin, account, deadline, chainId } =
      removeNativeLiquidityData;

    const tokenAddress = token ? token?.address : '';
    const accountId = account ? this.hederaId(account) : '';
    const contractId = this.hederaId(ROUTER_ADDRESS[chainId]);

    const maxGas = TRANSACTION_MAX_FEES.REMOVE_NATIVE_LIQUIDITY;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'removeLiquidityAVAX',
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addUint256(liquidityAmount as any)
          .addUint256(tokenAmountMin as any)
          .addUint256(HBARAmountMin as any)
          .addAddress(account)
          .addUint256(deadline),
      );

    return hashConnect.sendTransaction(transaction, accountId);
  }

  async removeLiquidity(removeLiquidityData: RemoveLiquidityData) {
    const { tokenA, tokenB, liquidityAmount, tokenAAmountMin, tokenBAmountMin, account, deadline, chainId } =
      removeLiquidityData;

    const tokenAAddress = tokenA ? tokenA?.address : '';
    const tokenBAddress = tokenB ? tokenB?.address : '';

    const accountId = account ? this.hederaId(account) : '';
    const contractId = this.hederaId(ROUTER_ADDRESS[chainId]);

    const maxGas = TRANSACTION_MAX_FEES.REMOVE_LIQUIDITY;
    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas)
      //Set the contract function to call
      .setFunction(
        'removeLiquidity',
        new ContractFunctionParameters()
          .addAddress(tokenAAddress)
          .addAddress(tokenBAddress)
          .addUint256(liquidityAmount as any)
          .addUint256(tokenAAmountMin as any)
          .addUint256(tokenBAmountMin as any)
          .addAddress(account)
          .addUint256(deadline),
      );

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public spendingApproval(approvalData: SendingApprovalData) {
    const { tokenAddress, amount, account, spender } = approvalData;

    const accountId = account ? this.hederaId(account) : '';
    const tokenId = this.hederaId(tokenAddress);

    const spenderId = spender ? this.hederaId(spender) : '';
    const approvalTx = new AccountAllowanceApproveTransaction().approveTokenAllowance(
      tokenId,
      accountId,
      spenderId,
      amount as any,
    );

    return hashConnect.sendTransaction(approvalTx, accountId);
  }

  public async getContractData(address: string) {
    try {
      const response = await this.call<ContractData>({
        url: `/api/v1/contracts/${address}`,
        method: 'GET',
      });

      return {
        contractId: response?.contract_id,
        evmAddress: response?.evm_address,
      };
    } catch (error) {
      console.log(error);
      return { contractId: '', evmAddress: '' };
    }
  }

  public async swap(swapData: SwapData) {
    const {
      methodName,
      account,
      recipient,
      tokenInAmount,
      tokenOutAmount,
      HBARAmount,
      path,
      exactAmountIn,
      chainId,
      deadline,
    } = swapData;

    const accountId = account ? this.hederaId(account) : '';
    const contractId = this.hederaId(ROUTER_ADDRESS[chainId]);

    const extraSwaps = path.length - 2;

    const maxGas =
      TRANSACTION_MAX_FEES.BASE_SWAP +
      extraSwaps * TRANSACTION_MAX_FEES.EXTRA_SWAP +
      extraSwaps * TRANSACTION_MAX_FEES.TOKEN_OUT_EXACT_SWAP;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas);

    if (HBARAmount) {
      transaction //Amount of HBAR we want to provide
        .setPayableAmount(Hbar.fromString(HBARAmount))
        .setFunction(
          methodName,
          new ContractFunctionParameters()
            .addUint256(tokenOutAmount as any)
            .addAddressArray(path)
            .addAddress(recipient)
            .addUint256(deadline),
        );
    } else {
      transaction.setFunction(
        methodName,
        new ContractFunctionParameters()
          .addUint256(exactAmountIn ? tokenInAmount : (tokenOutAmount as any))
          .addUint256(exactAmountIn ? tokenOutAmount : (tokenInAmount as any))
          .addAddressArray(path)
          .addAddress(recipient)
          .addUint256(deadline),
      );
    }

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async sarStake(stakeData: SarStakeData) {
    const { positionId, amount, methodName, account, chainId, rent } = stakeData;

    const accountId = account ? this.hederaId(account) : '';
    const address = SAR_STAKING_ADDRESS[chainId];
    const contractId = address ? this.hederaId(address) : '';

    const error = new Error('Unpredictable HBAR amount to pay rent');
    try {
      if (Number(rent) < 0) {
        throw error;
      }
    } catch {
      throw error;
    }

    const maxGas =
      TRANSACTION_MAX_FEES.STAKE_LP_TOKEN + TRANSACTION_MAX_FEES.TRANSFER_ERC20 + TRANSACTION_MAX_FEES.NFT_MINT;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas);

    if (methodName === 'mint') {
      transaction
        .setPayableAmount(Hbar.fromTinybars(rent))
        .setFunction(methodName, new ContractFunctionParameters().addUint256(amount as any));
    }
    if (!!positionId && methodName === 'stake') {
      transaction
        .setPayableAmount(Hbar.fromTinybars(rent))
        .setFunction(
          methodName,
          new ContractFunctionParameters().addUint256(positionId as any).addUint256(amount as any),
        );
    }

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async sarUnstake(unstakeData: SarUnstakeData) {
    const { positionId, amount, account, chainId, rent } = unstakeData;

    const accountId = account ? this.hederaId(account) : '';
    const address = SAR_STAKING_ADDRESS[chainId];
    const contractId = address ? this.hederaId(address) : '';

    const error = new Error('Unpredictable HBAR amount to pay rent');
    try {
      if (Number(rent) < 0) {
        throw error;
      }
    } catch {
      throw error;
    }

    const maxGas = TRANSACTION_MAX_FEES.REMOVE_LIQUIDITY + TRANSACTION_MAX_FEES.TRANSFER_ERC20;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas);

    transaction
      .setPayableAmount(Hbar.fromTinybars(rent))
      .setFunction(
        'withdraw',
        new ContractFunctionParameters().addUint256(positionId as any).addUint256(amount as any),
      );

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async sarHarvestOrCompound(baseData: SarBaseData, methodName: 'harvest' | 'compound') {
    const { positionId, account, chainId, rent } = baseData;

    const accountId = account ? this.hederaId(account) : '';
    const address = SAR_STAKING_ADDRESS[chainId];
    const contractId = address ? this.hederaId(address) : '';

    const error = new Error('Unpredictable HBAR amount to pay rent');
    try {
      if (Number(rent) < 0) {
        throw error;
      }
    } catch {
      throw error;
    }

    const maxGas = TRANSACTION_MAX_FEES.COLLECT_REWARDS + TRANSACTION_MAX_FEES.TRANSFER_ERC20;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas);

    transaction
      .setPayableAmount(Hbar.fromTinybars(rent))
      .setFunction(methodName, new ContractFunctionParameters().addUint256(positionId as any));

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async createPangoChefUserStorageContract(chainId: ChainId, account: string) {
    const pangoChefId = PANGOCHEF_ADDRESS[chainId];

    const maxGas = TRANSACTION_MAX_FEES.CREATE_POOL;
    const accountId = account ? this.hederaId(account) : '';
    const contractId = pangoChefId ? this.hederaId(pangoChefId) : '';

    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(maxGas)
      .setFunction('createUserStorageContract');
    return hashConnect.sendTransaction(transaction, accountId);
  }

  public convertHBarToTinyBars(value: string | number) {
    return new Hbar(value).to(HbarUnit.Tinybar).toString();
  }

  public convertTinyBarToHbar(value: string | number) {
    return Hbar.fromTinybars(value);
  }

  public tinyCentsToTinyBars(
    tinyCents: string,
    exchangeRate: {
      cent_equivalent: number;
      hbar_equivalent: number;
    },
  ) {
    const tinyCentsRate = this.convertHBarToTinyBars(exchangeRate.cent_equivalent.toString());
    const tinyBarRate = this.convertHBarToTinyBars(exchangeRate.hbar_equivalent.toString());

    try {
      if (Number(tinyCentsRate) === 0) {
        return '0';
      }
    } catch {
      return '0';
    }
    const tinyHbarPerTinyCents = new Fraction(tinyBarRate, tinyCentsRate); // HBAR/CENTS

    return tinyHbarPerTinyCents.multiply(tinyCents).toFixed(0);
  }

  public async stakeOrWithdraw(stakeOrWithdrawData: StakeOrWithdrawData) {
    const { account, amount, poolId, chainId, methodName } = stakeOrWithdrawData;

    const pangoChefId = PANGOCHEF_ADDRESS[chainId];
    const accountId = account ? this.hederaId(account) : '';
    const contractId = pangoChefId ? this.hederaId(pangoChefId) : '';

    const maxGas =
      methodName === 'stake'
        ? TRANSACTION_MAX_FEES.STAKE_LP_TOKEN + TRANSACTION_MAX_FEES.TRANSFER_ERC20
        : TRANSACTION_MAX_FEES.WITHDRAW;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas);

    transaction.setFunction(
      methodName,
      new ContractFunctionParameters().addUint256(Number(poolId)).addUint256(amount ? amount : (amount as any)),
    );

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async claimReward(claimRewardData: ClaimRewardData) {
    const { account, methodName, poolId, chainId } = claimRewardData;

    const pangoChefId = PANGOCHEF_ADDRESS[chainId];
    const accountId = account ? this.hederaId(account) : '';
    const contractId = pangoChefId ? this.hederaId(pangoChefId) : '';

    const maxGas = TRANSACTION_MAX_FEES.COLLECT_REWARDS;

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas);

    transaction.setFunction(methodName, new ContractFunctionParameters().addUint256(Number(poolId)));

    return hashConnect.sendTransaction(transaction, accountId);
  }

  public async compound(compoundData: CompoundData) {
    const { account, methodName, poolId, chainId, slippage, contract } = compoundData;

    const pangoChefId = PANGOCHEF_ADDRESS[chainId];
    const accountId = account ? this.hederaId(account) : '';
    const contractId = pangoChefId ? this.hederaId(pangoChefId) : '';

    const minichef = CHAINS[chainId].contracts?.mini_chef;
    const compoundPoolId = minichef?.compoundPoolIdForNonPngFarm ?? 0;

    const maxGas = TRANSACTION_MAX_FEES.COMPOUND;

    const arg = methodName === 'compound' ? [poolId, slippage] : [poolId, compoundPoolId.toString(), slippage];

    // compound transaction is little different than all other transaction
    // because in compound input we have slippage which is tuple
    // tuple as input is not supported by hedera sdk as of now
    // so we are enconding function parameters and passing it as Uint8Array
    const functionCallAsUint8Array = contract.interface.encodeFunctionData(methodName, arg);
    const encodedParametersHex = functionCallAsUint8Array.slice(2);

    const params = Buffer.from(encodedParametersHex, 'hex');

    const transaction = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(contractId)
      //Set the gas for the contract call
      .setGas(maxGas)
      .setPayableAmount(Hbar.fromString('0'))
      .setFunctionParameters(params);

    return hashConnect.sendTransaction(transaction, accountId);
  }
}

export const hederaFn = new Hedera();
/* eslint-enable max-lines */
