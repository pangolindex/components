export interface ViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface FunctionCallOptions extends ViewFunctionOptions {
  gas?: string;
  amount?: string | null;
}

export interface NearTransaction {
  receiverId: string;
  functionCalls: FunctionCallOptions[];
}

export interface NearPoolData {
  id: number;
  token_account_ids: string[];
  token_symbols: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  pool_kind: string;
}

export interface NearTokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export interface StorageDepositActionOptions {
  accountId?: string;
  registrationOnly?: boolean;
  amount: string;
}

export interface WithdrawActionOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
  singleTx?: boolean;
}
