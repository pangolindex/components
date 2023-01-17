import avalancheCoreIcon from 'src/assets/images/avalancheCore.svg';
import bitKeepIcon from 'src/assets/images/bitkeep.svg';
import talismanIcon from 'src/assets/images/talisman.svg';
import { avalancheCore, bitKeep, injected, talisman } from 'src/connectors';
import { Wallet } from './wallet';

export class InjectedWallet extends Wallet {
  isWallet?: boolean;
  conditionToShowWallet?: () => boolean;

  constructor(
    name: string,
    href: string | null,
    icon: string,
    description: string,
    isWallet?: boolean,
    conditionToShowWallet?: () => boolean,
  ) {
    super(injected, name, href, icon, description);
    this.isWallet = isWallet;
    this.conditionToShowWallet = conditionToShowWallet;
  }

  override showWallet(): boolean {
    if (this.conditionToShowWallet) return this.conditionToShowWallet();
    return super.showWallet();
  }

  installed(): boolean {
    return this.isWallet ?? true;
  }
}

export class TalismanWallet extends Wallet {
  constructor() {
    super(talisman, 'Talisman', 'https://www.talisman.xyz/', talismanIcon, 'Enter the Paraverse.');
  }

  installed(): boolean {
    return Boolean(window.ethereum && window.ethereum.isTalisman);
  }
}

export class BitKeepWallet extends Wallet {
  constructor() {
    super(bitKeep, 'BitKeep', 'https://bitkeep.com/', bitKeepIcon, 'Easy-to-use browser extension.');
  }

  installed(): boolean {
    return Boolean(window.isBitKeep && !!window.bitkeep.ethereum);
  }
}

export class AvalancheCoreWallet extends Wallet {
  constructor() {
    super(avalancheCore, 'Avalanche Core', 'https://core.app/', avalancheCoreIcon, 'Easy-to-use browser extension.');
  }

  installed(): boolean {
    return !!window.avalanche;
  }
}
