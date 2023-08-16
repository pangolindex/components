import { BridgeChain, BridgeCurrency } from '@pangolindex/sdk';
import { GetRoutesProps } from 'src/state/pbridge/types';

export type BridgeCardProps = {
  slippageTolerance: string;
  account?: string | null;
  fromChain?: BridgeChain;
  inputCurrency?: BridgeCurrency;
  outputCurrency?: BridgeCurrency;
  recipient?: string | null;
  toChain?: BridgeChain;
  setSlippageTolerance: React.Dispatch<React.SetStateAction<string>>;
  getRoutes: (props: GetRoutesProps) => void;
};
