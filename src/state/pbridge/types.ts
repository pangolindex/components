import { Bridge } from '@pangolindex/sdk';

export enum BridgePrioritizations {
  recommended,
  fast,
  normal,
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
  toAmountUSD: string;
  toToken: string;
  toAddress?: string;
  gasCostUSD?: string;
  steps: Step[];
  transactionType: BridgePrioritizations;
  selected: boolean;
};
export declare type Step = SwapStep | BridgeStep;

export declare type StepType = 'swap' | 'cross' | 'bridge' | 'custom';

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

export interface SwapStep extends StepBase {
  type: 'swap';
  action: Action;
  estimate: Estimate;
}

export interface Action {
  fromChainId: number;
  fromAmount: string;
  fromToken: string;
  fromAddress?: string;
  toChainId: number;
  toToken: string;
  toAddress?: string;
  slippage: number;
}

export interface Estimate {
  fromAmount: string;
  fromAmountUSD?: string;
  toAmount: string;
  toAmountUSD?: string;
  approvalAddress: string;
  feeCostsUSD?: string;
  gasCostsUSD?: string;
  executionDuration: number;
  data?: any;
}
