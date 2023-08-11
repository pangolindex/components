import { Chain } from '@pangolindex/sdk';

export type NetworkProps = {
  open: boolean;
  closeModal: () => void;
  onToogleWalletModal: (chain: Chain) => void;
};

export enum NETWORK_TYPE {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}
