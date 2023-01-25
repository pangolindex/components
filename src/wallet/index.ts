import { ALL_CHAINS, NetworkType } from '@pangolindex/sdk';
import { isMobile } from 'react-device-detect';
import injectWalletIcon from 'src/assets/images/inject-wallet.png';
import metamaskIcon from 'src/assets/images/metamask.png';
import rabbyIcon from 'src/assets/images/rabby.svg';
import { AvalancheCoreWallet, BitKeepWallet, InjectedWallet, TalismanWallet } from './classes/injected';
import { HashPackWallet, NearWallet, XDefiWallet } from './classes/nonInjected';
import { CoinbaseWallet, GnosisSafeWallet, WalletConnect } from './classes/others';
import { Wallet } from './classes/wallet';

const injectWallet = new InjectedWallet(
  'Inject',
  null,
  injectWalletIcon,
  'Injected Wallet.',
  [NetworkType.EVM],
  undefined,
  undefined,
  () => isMobile,
);
const metamask = new InjectedWallet(
  'Metamask',
  'https://metamask.io/',
  metamaskIcon,
  'A crypto wallet & gateway to blockchain apps.',
  [NetworkType.EVM],
  undefined,
  'isMetaMask',
);
const rabbyWallet = new InjectedWallet(
  'Rabby Wallet',
  'https://rabby.io/',
  rabbyIcon,
  'Easy-to-use browser extension.',
  [NetworkType.EVM],
  undefined,
  'isRabby',
);

const talismanWallet = new TalismanWallet();
const bitkeepWallet = new BitKeepWallet();
const avalanhceCoreWallet = new AvalancheCoreWallet();

const xDefiWallet = new XDefiWallet();
const nearWallet = new NearWallet();
const hashPack = new HashPackWallet();

const gnosisSafeWallet = new GnosisSafeWallet();
const coinbaseWallet = new CoinbaseWallet();
const walletConnect = new WalletConnect();

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
  GNOSISSAFE: gnosisSafeWallet,
  WALLET_LINK: coinbaseWallet,
  WALLET_CONNECT: walletConnect,
};

export const SUPPORTED_CHAINS = ALL_CHAINS.filter((chain) => chain.pangolin_is_live || chain.supported_by_bridge);
