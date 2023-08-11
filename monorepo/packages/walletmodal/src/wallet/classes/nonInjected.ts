import { ChainId, NetworkType } from '@pangolindex/sdk';
import hashIcon from 'src/assets/images/hashConnect.png';
import nearIcon from 'src/assets/svg/near.svg';
import xDefiIcon from 'src/assets/images/xDefi.png';
import { HashConnector, SUPPORTED_XDEFI_CHAINS, hashConnect, near, xDefi } from 'src/connectors'; // TODO FIX
import { Wallet, activeFunctionType } from './wallet';

export class XDefiWallet extends Wallet {
  constructor() {
    super({
      connector: xDefi,
      name: 'XDEFI Wallet',
      href: 'https://www.xdefi.io',
      icon: xDefiIcon,
      description: 'One wallet for all your Crypto.',
      supportedChains: [NetworkType.EVM],
      supportedChainsId: SUPPORTED_XDEFI_CHAINS,
    });
  }

  installed(): boolean {
    return !!window.xfi && !!window.xfi.ethereum && !!window.xfi.ethereum.isXDEFI;
  }
}

export class NearWallet extends Wallet {
  constructor() {
    super({
      connector: near,
      name: 'Near',
      href: 'https://wallet.near.org/',
      icon: nearIcon,
      description: 'Near Web.',
      supportedChains: [NetworkType.NEAR],
    });
  }

  installed(): boolean {
    return true;
  }
}

export class HashPackWallet extends Wallet {
  constructor(supportedChainsId: ChainId[]) {
    super({
      connector: hashConnect,
      name: 'HashPack Wallet',
      href: 'https://www.hashpack.app/',
      icon: hashIcon,
      description: 'HashPack Wallet Connect.',
      supportedChains: [NetworkType.HEDERA],
      supportedChainsId,
    });
  }

  public override async tryActivation({
    activate,
    onSuccess,
    onError,
    chainId,
  }: {
    activate: activeFunctionType;
    onSuccess?: () => void;
    onError?: (error: unknown) => Promise<void>;
    chainId?: ChainId;
  }) {
    const connector = this.connector as HashConnector;
    const connectorChainId = await connector.getChainId();
    if (chainId && chainId !== connectorChainId) {
      connector.changeConfig(chainId);
    }

    await super.tryActivation({ activate, onSuccess, onError });
  }

  public installed(): boolean {
    return true;
  }
}
