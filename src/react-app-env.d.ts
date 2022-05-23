/// <reference types="react-scripts" />

interface Window {
  WalletLinkProvider?: any;
  walletLinkExtension?: any;
  xfi?: any;
  ethereum?: {
    isCoinbaseWallet?: boolean;
    isMetaMask?: true;
    isXDEFI?: true;
    isRabby?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    request: (...args: any[]) => Promise<any>;
  };
}
