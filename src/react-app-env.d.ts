declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement;
}

declare module 'fortmatic';

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
  web3?: {};
  pendo?: any;
}