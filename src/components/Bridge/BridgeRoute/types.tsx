import { BridgePrioritizations, Step } from 'src/state/pbridge/types';

export type BridgeRouteProps = {
  onSelectRoute: () => void;
  waitingTime?: string;
  toAmount: string;
  fromAmount: string;
  toAmountUSD?: string;
  minAmount?: string;
  toToken: string;
  gasCostUSD?: string;
  steps: Step[];
  transactionType: BridgePrioritizations;
  selected: boolean;
};
