import { BridgePrioritizations } from '..';

export type Step = {
  contractType?: string;
  subSteps?: string[];
};

export type BridgeRouteProps = {
  steps: Step[];
  transactionType: BridgePrioritizations;
  selected: boolean;
  estimatedToken: string;
  estimatedResult: string;
  min: string;
  gasCost: string;
};
