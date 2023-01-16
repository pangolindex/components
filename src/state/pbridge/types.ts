import { CallType, RouteData as SquidRoute } from '@0xsquid/sdk';
import { Route as LifiRoute } from '@lifi/sdk';
import { Bridge, BridgeChain, BridgeCurrency } from '@pangolindex/sdk';

export type BridgeTransfer = {
  id?: string;
  date: string;
  fromAmount: string;
  fromChain: BridgeChain;
  fromCurrency: BridgeCurrency;
  toAmount: string;
  toChain: BridgeChain;
  toCurrency: BridgeCurrency;
  bridgeProvider: Bridge;
  status: BridgeTransferStatus;
  errorMessage?: string;
  nativeRoute?: LifiRoute | SquidRoute;
};

export enum BridgeTransferStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export enum BridgePrioritizations {
  RECOMMENDED,
  NORMAL,
  FASTEST,
  CHEAPEST,
  SAFEST,
}

export type Route = {
  id?: string;
  bridgeType: Bridge;
  waitingTime?: string;
  toAmount: string;
  toAmountNet: string;
  toAmountUSD?: string;
  toToken: string;
  gasCostUSD?: string;
  steps: Step[];
  transactionType: BridgePrioritizations;
  selected: boolean;
  nativeRoute?: LifiRoute | SquidRoute;
  recipient?: string;
  minAmount?: string;
  fromChain: BridgeChain;
  toChain: BridgeChain;
  fromCurrency: BridgeCurrency;
  toCurrency: BridgeCurrency;
  fromAmount: string;
};

export declare type Step = SwapStep | BridgeStep | LifiStep | CrossStep | CustomStep | SquidStep;

export declare type StepType = 'swap' | 'cross' | 'lifi' | 'bridge' | 'custom';

export interface StepBase {
  type: StepType;
  integrator?: string;
  action?: Action;
  estimate?: Estimate;
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

export interface SquidStep {
  type: CallType;
  integrator?: string;
  action: Action;
  estimate: Estimate;
}

export interface CrossStep extends StepBase {
  type: 'cross';
  action: Action;
  estimate: Estimate;
}

export interface Action {
  toToken: string;
}

export interface Estimate {
  toAmount: string;
}

export type SendTransactionFunc = (selectedRoute: Route, account?: string | null) => Promise<void>;

export type ResumeTransactionFunc = (transfer: BridgeTransfer, account?: string | null) => Promise<void>;

export type SendTransaction = {
  lifi: SendTransactionFunc;
  squid: SendTransactionFunc;
  hashport: SendTransactionFunc;
};

export type ResumeTransaction = {
  lifi: ResumeTransactionFunc;
};

export type GetRoutes = (
  amount: string,
  slipLimit: string,
  fromChain?: BridgeChain,
  toChain?: BridgeChain,
  fromAddress?: string | null,
  fromCurrency?: BridgeCurrency,
  toCurrency?: BridgeCurrency,
  recipient?: string | null | undefined,
) => void;
