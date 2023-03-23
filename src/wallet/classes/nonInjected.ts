import { ChainId, NetworkType } from '@pangolindex/sdk';
import hashIcon from 'src/assets/images/hashConnect.png';
import nearIcon from 'src/assets/images/near.svg';
import xDefiIcon from 'src/assets/images/xDefi.png';
import { HashConnector, near, xDefi } from 'src/connectors';
import { Wallet } from './wallet';

export class XDefiWallet extends Wallet {
  constructor() {
    super({
      connector: xDefi,
      name: 'XDEFI Wallet',
      href: 'https://www.xdefi.io',
      icon: xDefiIcon,
      description: 'One wallet for all your Crypto.',
      supportedChains: [NetworkType.EVM],
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
  constructor(connector: HashConnector, supportedChainsId: ChainId[]) {
    super({
      connector,
      name: 'HashPack Wallet',
      href: 'https://www.hashpack.app/',
      icon: hashIcon,
      description: 'HashPack Wallet Connect.',
      supportedChains: [NetworkType.HEDERA],
      supportedChainsId,
    });
  }

  installed(): boolean {
    return true;
  }
}
