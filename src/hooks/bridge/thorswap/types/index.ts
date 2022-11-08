export interface ThorswapRoute {
  path: string;
  providers: string[];
  subProviders: string[];
  swaps: { [k: string]: any[][] }; //ITxDetailsRoutesSwap
  expectedOutput: string;
  expectedOutputMaxSlippage: string;
  expectedOutputUSD?: string;
  expectedOutputMaxSlippageUSD?: string;
  fees: { [k: string]: IFees[] };
  calldata?: any;
  transaction?: ITransaction;
  contract?: string;
  contractMethod?: string;
  contractInfo?: string;
  optimal: boolean;
  complete?: boolean;
  isPreferred?: boolean;
}

export interface ITxDetailsMeta {
  sellChain: string;
  sellChainGasRate: string;
  buyChain: string;
  buyChainGasRate: string;
  quoteMode: any; //QuoteMode
}
export interface ITransaction {
  to: string;
  from: string;
  data: string;
  value: string;
}

export interface IFees {
  asset: string;
  affiliateFee: number;
  affiliateFeeUSD: number;
  networkFee: number;
  networkFeeUSD: number;
  slipFee?: number;
  slipFeeUSD?: number;
  totalFee: number;
  totalFeeUSD: number;
}

export interface ITokenQuoteResponse {
  quoteId: string;
  contract: string;
  contractInfo: string;
  path: string;
  complete: boolean;
  providers: string[];
  calldata: any; //ISwap
  fees: { [k: string]: IFees[] };
  transaction?: ITransaction;
  estimatedTime: number;
  expectedOutput?: string;
  expectedOutputMaxSlippage?: string;
  expectedOutputUSD?: string;
  expectedOutputMaxSlippageUSD?: string;
  routes: ThorswapRoute[];
  meta: ITxDetailsMeta;
}
