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

// /**
//  * Generic interface to return all possible calldata parameters
//  * Empty because there are no common attributes between all variants
//  */
// export class ISwap {}

// /**
//  * Generic interface for TC to ERC20 swap out data
//  */
// export class ISwapOut extends ISwap {
//   public fromAsset: string;
//   public amountIn: string;
//   public amountOutMin: string;
//   public memo: string;
//   public token: string;
//   public toAddress: string;
//   public aggregatorAddress: string;
// }

// // Provider specific SwapIn interfaces
// export class ISwapInUniswap extends ISwap {
//   public tcRouter: string;
//   public tcVault: string;
//   public tcMemo: string;
//   public token: string;
//   public amount: string;
//   public amountOutMin: string;
//   public deadline: string;
// }

// export class ISwapInPangolin extends ISwap {
//   public tcRouter: string;
//   public tcVault: string;
//   public tcMemo: string;
//   public token: string;
//   public amount: string;
//   public amountOutMin: string;
//   public deadline: string;
// }

// export class IGenericSwapIn extends ISwap {
//   public tcRouter: string;
//   public tcVault: string;
//   public tcMemo: string;
//   public token: string;
//   public amount: string;
//   public router: string;
//   public data: string;
//   public deadline: string;
// }

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
