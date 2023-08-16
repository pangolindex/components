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
    send: unknown;
    enable: () => Promise<string[]>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    request: (...args: any[]) => Promise<any>;
    getBlock?: (block) => Promise<any>;
    getTransactionReceipt?: (hash) => Promise<any>;
    getBlockNumber?: () => Promise<any>;
    execute?: (method, params) => Promise<any>;
  };
  web3?: any;
  pendo?: any;
  avalanche?: {
    isAvalanche?: boolean;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
  };
}

declare const __DEV__: boolean;
