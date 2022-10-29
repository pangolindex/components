import { Bridge } from '@pangolindex/sdk';

export enum BridgePrioritizations {
  RECOMMENDED,
  NORMAL,
  FASTEST,
  CHEAPEST,
  SAFEST,
}

export type Route = {
  memo?: string;
  waitingTime: string;
  fromChainId: string;
  fromAmount: string;
  fromToken: string;
  fromAddress?: string;
  toChainId: string;
  toAmount: string;
  toAmountNet: string;
  toAmountUSD: string;
  toToken: string;
  toAddress?: string;
  gasCostUSD?: string;
  steps: Step[];
  transactionType: BridgePrioritizations;
  selected: boolean;
};
export declare type Step = SwapStep | BridgeStep | LifiStep | CrossStep | CustomStep;

export declare type StepType = 'swap' | 'cross' | 'lifi' | 'bridge' | 'custom';

export interface StepBase {
  id?: string;
  type: StepType;
  // toolDetails: Pick<ExchangeAggregator | Exchange | Bridge, 'key' | 'name' | 'logoURI'>;
  integrator?: string;
  referrer?: string;
  action?: Action;
  estimate?: Estimate;
  // execution?: Execution;
}

export interface BridgeStep extends StepBase {
  type: 'bridge';
  bridge: Bridge;
  includedSteps: Step[];
}

export interface LifiStep extends StepBase {
  type: 'lifi';
  bridge: Bridge;
  action: Action;
  estimate: Estimate;
  includedSteps: Step[];
}

export interface CustomStep extends StepBase {
  type: 'custom';
  bridge: Bridge;
  destinationCallInfo: {
    toContractAddress: string;
    toContractCallData: string;
    toFallbackAddress: string;
    callDataGasLimit: string;
  };
}

export interface SwapStep extends StepBase {
  type: 'swap';
  action: Action;
  estimate: Estimate;
}

export interface CrossStep extends StepBase {
  type: 'cross';
  action: Action;
  estimate: Estimate;
}

export interface Action {
  fromChainId: number | string;
  fromAmount: string;
  fromToken: string;
  toChainId: number | string;
  toToken: string;
  slippage: number;
  toAddress?: string;
  fromAddress?: string;
}

export interface Estimate {
  fromAmount: string;
  toAmount: string;
  approvalAddress: string;
  executionDuration: number;
  fromAmountUSD?: string;
  toAmountMin?: string;
  toAmountUSD?: string;
  feeCostsUSD?: string;
  gasCostsUSD?: string;
  data?: any;
}
