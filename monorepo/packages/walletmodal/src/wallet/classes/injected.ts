import { CHAINS, ChainId, NetworkType } from '@pangolindex/sdk';
import { SUPPORTED_EVM_CHAINS_ID, avalancheCore, bitKeep, injected, talisman } from 'src/connectors'; // TODO FIX
import avalancheCoreIcon from 'src/assets/svg/avalancheCore.svg';
import bitKeepIcon from 'src/assets/svg/bitkeep.svg';
import talismanIcon from 'src/assets/svg/talisman.svg';
import { Wallet } from './wallet';

export class InjectedWallet extends Wallet {
  readonly walletKey?: string;
  readonly conditionToShowWallet?: () => boolean;

  /**
   * @param connector The connector in AbstractConnector object
   * @param name Name of wallet
   * @param href Link of the wallet website
   * @param icon Link of the wallet icon
   * @param description Breef description of wallet
   * @param supportedChains Array of NetworkType that this wallet support
   * @param supportedChainsId Array of Chain ids that this wallet support
   * @param walletKey The key in window.ethereum that identifies whether this wallet is active
   * @param conditionToShowWallet Function that will be executed to show the wallet
   */
  constructor(args: {
    name: string;
    href: string | null;
    icon: string;
    description: string;
    supportedChains: NetworkType[];
    supportedChainsId?: number[];
    walletKey?: string;
    conditionToShowWallet?: () => boolean;
  }) {
    const { name, href, icon, description, supportedChains, supportedChainsId, walletKey, conditionToShowWallet } =
      args;

    super({ connector: injected, name, href, icon, description, supportedChains, supportedChainsId });

    this.walletKey = walletKey;
    this.conditionToShowWallet = conditionToShowWallet;
  }

  override showWallet(): boolean {
    if (this.conditionToShowWallet) return this.conditionToShowWallet();
    return super.showWallet();
  }

  installed(): boolean {
    return this.walletKey ? Boolean(window.ethereum && window.ethereum[this.walletKey]) : true;
  }
}

export class TalismanWallet extends Wallet {
  constructor() {
    super({
      connector: talisman,
      name: 'Talisman',
      href: 'https://www.talisman.xyz/',
      icon: talismanIcon,
      description: 'Enter the Paraverse.',
      supportedChains: [NetworkType.EVM],
    });
  }

  installed(): boolean {
    return Boolean(window.talismanEth);
  }
}

export class BitKeepWallet extends Wallet {
  constructor() {
    super({
      connector: bitKeep,
      name: 'BitKeep',
      href: 'https://bitkeep.com/',
      icon: bitKeepIcon,
      description: 'Easy-to-use browser extension.',
      supportedChains: [NetworkType.EVM],
      supportedChainsId: SUPPORTED_EVM_CHAINS_ID.filter(
        (chainId) => ![ChainId.SONGBIRD, ChainId.FLARE_MAINNET].includes(chainId) && CHAINS[chainId]?.mainnet,
      ), // not show bitkeep in chains above because bitkeep not support it
    });
  }

  installed(): boolean {
    return Boolean(window.isBitKeep && !!window.bitkeep.ethereum);
  }
}

export class AvalancheCoreWallet extends Wallet {
  constructor() {
    super({
      connector: avalancheCore,
      name: 'Core',
      href: 'https://core.app/',
      icon: avalancheCoreIcon,
      description: 'Easy-to-use browser extension.',
      supportedChains: [NetworkType.EVM],
    });
  }

  installed(): boolean {
    return !!window.avalanche;
  }
}
