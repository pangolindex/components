import { Chain } from '@pangolindex/sdk';
import { SUPPORTED_WALLETS } from 'src/wallet';

export type WalletModalProps = {
  open: boolean;
  closeModal: () => void;
  onWalletConnect: (wallet: string | null) => void;
  supportedWallets?: typeof SUPPORTED_WALLETS;
  supportedChains?: Chain[];
  initialChainId?: number;
};
