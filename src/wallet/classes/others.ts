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
    super(gnosisSafe, 'Gnosis Safe', 'https://app.safe.global/', gnosisSafeIcon, 'Gnosis Safe Multisig Wallet', [
      NetworkType.EVM,
    ]);
  }

  showWallet(): boolean {
    return this.isInSafe;
  }

  installed(): boolean {
    return this.isInSafe;
  }

  async tryActivation(activate: activeFunctionType, onSuccess: () => void, onError: (error: unknown) => void) {
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
    super(
      walletlink,
      'Coinbase Wallet',
      'https://www.coinbase.com/pt/wallet',
      coinbaseWalletIcon,
      'Use Coinbase Wallet app on mobile device',
      [NetworkType.EVM],
    );
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
    super(walletconnect, 'WalletConnect', 'https://walletconnect.com/', walletConnectIcon, 'Use Wallet Connect', [
      NetworkType.EVM,
    ]);
  }

  showWallet(): boolean {
    return !isMobile;
  }

  installed(): boolean {
    return true;
  }
}
