import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { NetworkType } from '@pangolindex/sdk';
import { isMobile } from 'react-device-detect';
import coinbaseWalletIcon from 'src/assets/images/coinbaseWalletIcon.png';
import gnosisSafeIcon from 'src/assets/images/gnosis_safe.png';
import walletConnectIcon from 'src/assets/images/walletConnectIcon.svg';
import { gnosisSafe, walletconnect, walletlink } from 'src/connectors';
import { IS_IN_IFRAME } from 'src/constants';
import { Wallet, activeFunctionType } from './wallet';

export class GnosisSafeWallet extends Wallet {
  private isInSafe =
    !isMobile &&
    IS_IN_IFRAME &&
    (location.hostname === 'app.safe.global' || location.hostname.endsWith('.safe.global'));

  private triedSafe = false;

  constructor() {
    super({
      connector: gnosisSafe,
      name: 'Gnosis Safe',
      href: 'https://app.safe.global/',
      icon: gnosisSafeIcon,
      description: 'Gnosis Safe Multisig Wallet.',
      supportedChains: [NetworkType.EVM],
    });
  }

  showWallet(): boolean {
    return this.isInSafe;
  }

  installed(): boolean {
    return this.isInSafe;
  }

  override async tryActivation(activate: activeFunctionType, onSuccess: () => void, onError: (error: unknown) => void) {
    if (!this.triedSafe) {
      const loadedSafe = await (this.connector as SafeAppConnector).isSafeApp();
      if (loadedSafe) {
        super.tryActivation(activate, onSuccess, onError);
      }
      this.triedSafe = true;
    }
  }
}

export class CoinbaseWallet extends Wallet {
  private isCbWalletDappBrowser = window?.ethereum?.isCoinbaseWallet;
  private isWalletlink = !!window?.WalletLinkProvider || !!window?.walletLinkExtension;
  private isCbWallet = this.isCbWalletDappBrowser || this.isWalletlink;

  constructor() {
    super({
      connector: walletlink,
      name: 'Coinbase Wallet',
      href: 'https://www.coinbase.com/wallet',
      icon: coinbaseWalletIcon,
      description: 'Your key to the world of crypto.',
      supportedChains: [NetworkType.EVM],
    });
  }

  showWallet(): boolean {
    return !isMobile;
  }

  installed(): boolean {
    return this.isCbWallet;
  }
}

export class WalletConnect extends Wallet {
  constructor() {
    super({
      connector: walletconnect,
      name: 'WalletConnect',
      href: 'https://walletconnect.com/',
      icon: walletConnectIcon,
      description:
        'With WalletConnect, you can connect your wallet with hundreds of apps, opening the doors to a new world of web3 experiences.',
      supportedChains: [NetworkType.EVM],
    });
  }

  showWallet(): boolean {
    return !isMobile;
  }

  installed(): boolean {
    return true;
  }
}
