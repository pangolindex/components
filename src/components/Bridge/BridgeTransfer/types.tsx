import { BridgeChain, BridgeCurrency } from '@pangolindex/sdk';
import { BridgeTransferStatus } from 'src/state/pbridge/types';

export type BridgeTransferProps = {
  onDelete?: () => void;
  onResume?: () => void;
  date: string;
  from: string;
  fromChain: BridgeChain;
  fromCurrency: BridgeCurrency;
  to: string;
  toChain: BridgeChain;
  toCurrency: BridgeCurrency;
  via: string;
  errorMessage?: string;
  status: BridgeTransferStatus;
  index: number;
};
