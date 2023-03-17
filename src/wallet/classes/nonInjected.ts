import { ChainId, NetworkType } from '@pangolindex/sdk';
import hashIcon from 'src/assets/images/hashConnect.png';
import nearIcon from 'src/assets/images/near.svg';
import xDefiIcon from 'src/assets/images/xDefi.png';
import { HashConnector, near, xDefi } from 'src/connectors';
import { Wallet } from './wallet';

export class XDefiWallet extends Wallet {
  constructor() {
    super(xDefi, 'XDEFI Wallet', 'https://www.xdefi.io', xDefiIcon, 'One wallet for all your Crypto.', [
      NetworkType.EVM,
    ]);
  }

  installed(): boolean {
    return !!window.xfi && !!window.xfi.ethereum && !!window.xfi.ethereum.isXDEFI;
  }
}

export class NearWallet extends Wallet {
  constructor() {
    super(near, 'Near', 'https://wallet.near.org/', nearIcon, 'Near Web.', [NetworkType.NEAR]);
  }

  installed(): boolean {
    return true;
  }
}
export class HashPackWallet extends Wallet {
  constructor(connector: HashConnector, supportedChainsId: ChainId[]) {
    super(
      connector,
      'HashPack Wallet',
      'https://www.hashpack.app/',
      hashIcon,
      'HashPack Wallet Connect.',
      [NetworkType.HEDERA],
      supportedChainsId,
    );
  }

  installed(): boolean {
    return true;
  }
}
