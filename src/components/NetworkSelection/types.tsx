import { Chain } from '@pangolindex/sdk';
import * as React from 'react';

export type NetworkProps = {
  open: boolean;
  closeModal: () => void;
  onSelectChain: (chain: Chain) => void;
};

export enum NETWORK_TYPE {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}
