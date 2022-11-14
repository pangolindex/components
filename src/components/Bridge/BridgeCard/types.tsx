import { BridgeCurrency, Chain } from '@pangolindex/sdk';
import { useBridgeSwapActionHandlers } from 'src/state/pbridge/hooks';
const { getRoutes } = useBridgeSwapActionHandlers();

export type BridgeCardProps = {
  slippageTolerance: string;
  account?: string | null;
  fromChain?: Chain;
  inputCurrency?: BridgeCurrency;
  outputCurrency?: BridgeCurrency;
  toChain?: Chain;
  setSlippageTolerance: React.Dispatch<React.SetStateAction<string>>;
  getRoutes: typeof getRoutes;
};
