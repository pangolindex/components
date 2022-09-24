import { Token } from '@pangolindex/sdk';

export enum BridgeState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export type BridgeTransferProps = {
  onDelete?: () => void;
  onResume?: () => void;
  date: string;
  from: string;
  fromChain: Token;
  fromCoin: Token;
  to: string;
  toChain: Token;
  toCoin: Token;
  via: string;
  state: BridgeState;
};
