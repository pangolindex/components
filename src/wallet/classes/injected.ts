import { NetworkType } from '@pangolindex/sdk';
import avalancheCoreIcon from 'src/assets/images/avalancheCore.svg';
import bitKeepIcon from 'src/assets/images/bitkeep.svg';
import talismanIcon from 'src/assets/images/talisman.svg';
import { avalancheCore, bitKeep, injected, talisman } from 'src/connectors';
import { Wallet } from './wallet';

export class InjectedWallet extends Wallet {
  isWallet?: string;
  conditionToShowWallet?: () => boolean;

  constructor(
    name: string,
    href: string | null,
    icon: string,
    description: string,
    supportedChains: NetworkType[],
    supportedChainsId?: number[],
    isWallet?: string,
    conditionToShowWallet?: () => boolean,
  ) {
    super(injected, name, href, icon, description, supportedChains, supportedChainsId);
    this.isWallet = isWallet;
    this.conditionToShowWallet = conditionToShowWallet;
  }

  override showWallet(): boolean {
    if (this.conditionToShowWallet) return this.conditionToShowWallet();
    return super.showWallet();
  }

  installed(): boolean {
    return this.isWallet ? Boolean(window.ethereum && window.ethereum[this.isWallet]) : true;
  }
}

export class TalismanWallet extends Wallet {
  constructor() {
    super(talisman, 'Talisman', 'https://www.talisman.xyz/', talismanIcon, 'Enter the Paraverse.', [NetworkType.EVM]);
  }

  installed(): boolean {
    return Boolean(window.ethereum && window.ethereum.isTalisman);
  }
}

export class BitKeepWallet extends Wallet {
  constructor() {
    super(bitKeep, 'BitKeep', 'https://bitkeep.com/', bitKeepIcon, 'Easy-to-use browser extension.', [NetworkType.EVM]);
  }

  installed(): boolean {
    return Boolean(window.isBitKeep && !!window.bitkeep.ethereum);
  }
}

export class AvalancheCoreWallet extends Wallet {
  constructor() {
    super(avalancheCore, 'Core', 'https://core.app/', avalancheCoreIcon, 'Easy-to-use browser extension.', [
      NetworkType.EVM,
    ]);
  }

  installed(): boolean {
    return !!window.avalanche;
  }
}
