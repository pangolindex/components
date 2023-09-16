import { BridgePrioritizations, Step } from 'src/hooks/types';

export type BridgeRouteProps = {
  onSelectRoute: () => void;
  waitingTime: string;
  toAmount: string;
  toAmountUSD: string;
  toToken: string;
  gasCostUSD?: string;
  steps: Step[];
  transactionType: BridgePrioritizations;
  selected: boolean;
};
