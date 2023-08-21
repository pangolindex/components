import { CHAINS, ChainId, NetworkType } from '@pangolindex/sdk';
import { SUPPORTED_EVM_CHAINS_ID } from '@pangolindex/wallet-connectors';
import { isMobile } from 'react-device-detect';
import rabbyIcon from 'src/assets/svg/rabby.svg';
import injectWalletIcon from 'src/assets/images/inject-wallet.png';
import metamaskIcon from 'src/assets/images/metamask.png';
import { AvalancheCoreWallet, BitKeepWallet, InjectedWallet, TalismanWallet } from './classes/injected';
import { HashPackWallet, NearWallet, XDefiWallet } from './classes/nonInjected';
import { CoinbaseWallet, GnosisSafeWallet } from './classes/others';
import { Wallet } from './classes/wallet';
import { WalletConnectWallet } from './classes/others';

export const injectWallet = new InjectedWallet({
  name: 'Inject',
  href: null,
  icon: injectWalletIcon,
  description: 'Injected Wallet.',
  supportedChains: [NetworkType.EVM],
  conditionToShowWallet: () => isMobile,
});
export const metamask = new InjectedWallet({
  name: 'Metamask',
  href: 'https://metamask.io/',
  icon: metamaskIcon,
  description: 'A crypto wallet & gateway to blockchain apps.',
  supportedChains: [NetworkType.EVM],
  walletKey: 'isMetaMask',
});
export const rabbyWallet = new InjectedWallet({
  name: 'Rabby Wallet',
  href: 'https://rabby.io/',
  icon: rabbyIcon,
  description: 'Easy-to-use browser extension.',
  supportedChains: [NetworkType.EVM],
  supportedChainsId: SUPPORTED_EVM_CHAINS_ID.filter((chainId) => CHAINS[chainId]?.mainnet),
  walletKey: 'isRabby',
});

export const talismanWallet = new TalismanWallet();
export const bitkeepWallet = new BitKeepWallet();
export const avalancheCoreWallet = new AvalancheCoreWallet();

export const xDefiWallet = new XDefiWallet();
export const nearWallet = new NearWallet();
export const hashPack = new HashPackWallet([ChainId.HEDERA_MAINNET, ChainId.HEDERA_TESTNET]);

export const gnosisSafeWallet = new GnosisSafeWallet();
export const coinbaseWallet = new CoinbaseWallet();

export const SUPPORTED_WALLETS: { [key: string]: Wallet } = {
  INJECTED: injectWallet,
  METAMASK: metamask,
  RABBY: rabbyWallet,
  TALISMAN: talismanWallet,
  BITKEEP: bitkeepWallet,
  AVALANCHECORE: avalancheCoreWallet,
  XDEFI: xDefiWallet,
  //NEAR: nearWallet,
  HASH_CONNECT: hashPack,
  GNOSISSAFE: gnosisSafeWallet,
  WALLET_LINK: coinbaseWallet,
};

export const SUPPORTED_CHAINS = Object.values(CHAINS).filter(
  (chain) => chain.pangolin_is_live || chain.supported_by_bridge,
);

export { Wallet as PangolinWallet, WalletConnectWallet as PangolinWalletConnectWallet };
