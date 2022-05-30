export type WalletModalProps = {
  open: boolean;
  closeModal: () => void;
  background?: string;
  shouldShowBackButton?: boolean;
  onWalletConnect: () => void;
  onClickBack?: () => void;
};
