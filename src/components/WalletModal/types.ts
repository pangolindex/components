import { SUPPORTED_WALLETS } from "src/wallet";

export type WalletModalProps = {
  open: boolean;
  closeModal: () => void;
  background?: string;
  shouldShowBackButton?: boolean;
  onWalletConnect: (wallet: string | null) => void;
  onClickBack?: () => void;
  additionalWallets?: typeof SUPPORTED_WALLETS;
};
