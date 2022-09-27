declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement;
}

declare module 'fortmatic';
/// <reference types="react-scripts" />
interface Window {
  WalletLinkProvider?: any;
  walletLinkExtension?: any;
  xfi?: any;
  talismanEth?: any;
  bitkeep?: any;
  isBitKeep?: true;
  ethereum?: {
    isCoinbaseWallet?: boolean;
    isMetaMask?: true;
    isXDEFI?: true;
    isRabby?: true;
    isTalisman?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    request: (...args: any[]) => Promise<any>;
    getBlock?: (block) => Promise<any>;
    getTransactionReceipt?: (hash) => Promise<any>;
    getBlockNumber?: () => Promise<any>;
    execute?: (method, params) => Promise<any>;
    getBlockTimestamp?: (blockNumber) => Promise<any>;
  };
  web3?: any;
  pendo?: any;
}
