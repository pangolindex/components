import { BridgeCurrency, Chain } from '@pangolindex/sdk';
import { GetRoutes } from 'src/state/pbridge/types';

export type BridgeCardProps = {
  slippageTolerance: string;
  account?: string | null;
  fromChain?: Chain;
  inputCurrency?: BridgeCurrency;
  outputCurrency?: BridgeCurrency;
  toChain?: Chain;
  setSlippageTolerance: React.Dispatch<React.SetStateAction<string>>;
  getRoutes: GetRoutes;
};
