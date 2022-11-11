import { BridgeCurrency, Chain } from '@pangolindex/sdk';
import { useBridgeSwapActionHandlers } from 'src/state/pbridge/hooks';
const { getRoutes } = useBridgeSwapActionHandlers();

export type BridgeCardProps = {
  infiniteApproval: boolean;
  slippageTolerance: string;
  account?: string | null;
  fromChain?: Chain;
  inputCurrency?: BridgeCurrency;
  outputCurrency?: BridgeCurrency;
  recipient?: string | null;
  toChain?: Chain;
  setSlippageTolerance: React.Dispatch<React.SetStateAction<string>>;
  setInfiniteApproval: React.Dispatch<React.SetStateAction<boolean>>;
  getRoutes: typeof getRoutes;
};
