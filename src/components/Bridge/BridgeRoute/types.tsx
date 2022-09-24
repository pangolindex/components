import { BridgePrioritizations } from '..';

export type BridgeRouteProps = {
  steps: any[];
  transactionType: BridgePrioritizations;
  selected: boolean;
  estimatedToken: string;
  estimatedResult: string;
  min: string;
  gasCost: string;
};
