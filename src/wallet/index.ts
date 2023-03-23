import { CHAINS, ChainId, NetworkType } from '@pangolindex/sdk';
import { isMobile } from 'react-device-detect';
import injectWalletIcon from 'src/assets/images/inject-wallet.png';
import metamaskIcon from 'src/assets/images/metamask.png';
import rabbyIcon from 'src/assets/images/rabby.svg';
import { mainnetHashConnect, testnetHashConnect } from 'src/connectors';
import { AvalancheCoreWallet, BitKeepWallet, InjectedWallet, TalismanWallet } from './classes/injected';
import { HashPackWallet, NearWallet, XDefiWallet } from './classes/nonInjected';
import { CoinbaseWallet, GnosisSafeWallet, WalletConnect } from './classes/others';
import { Wallet } from './classes/wallet';

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
  walletKey: 'isRabby',
});

export const talismanWallet = new TalismanWallet();
export const bitkeepWallet = new BitKeepWallet();
export const avalanhceCoreWallet = new AvalancheCoreWallet();

export const xDefiWallet = new XDefiWallet();
export const nearWallet = new NearWallet();
export const hashPack = new HashPackWallet(mainnetHashConnect, [ChainId.HEDERA_MAINNET]);
export const hashPackTestnet = new HashPackWallet(testnetHashConnect, [ChainId.HEDERA_TESTNET]);

export const gnosisSafeWallet = new GnosisSafeWallet();
export const coinbaseWallet = new CoinbaseWallet();
export const walletConnect = new WalletConnect();

export const SUPPORTED_WALLETS: { [key: string]: Wallet } = {
  INJECTED: injectWallet,
  METAMASK: metamask,
  RABBY: rabbyWallet,
  TALISMAN: talismanWallet,
  BITKEEP: bitkeepWallet,
  AVALANCHECORE: avalanhceCoreWallet,
  XDEFI: xDefiWallet,
  NEAR: nearWallet,
  HASH_CONNECT: hashPack,
  HASH_CONNECT_TESTNET: hashPackTestnet,
  GNOSISSAFE: gnosisSafeWallet,
  WALLET_LINK: coinbaseWallet,
  WALLET_CONNECT: walletConnect,
};

export const SUPPORTED_CHAINS = Object.values(CHAINS);