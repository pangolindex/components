import { SUPPORTED_WALLETS } from 'src/wallet';

export type WalletModalProps = {
  open: boolean;
  closeModal: () => void;
  onWalletConnect: (wallet: string | null) => void;
  additionalWallets?: typeof SUPPORTED_WALLETS;
};
