import { AvalancheCoreWallet, BitKeepWallet, InjectedWallet, TalismanWallet } from "./classes/injected";
import { Wallet } from "./classes/wallet";
import injectWalletIcon from 'src/assets/images/inject-wallet.png';
import metamaskIcon from 'src/assets/images/metamask.png';
import rabbyIcon from 'src/assets/images/rabby.svg';
import { HashPackWallet, NearWallet, XDefiWallet } from "./classes/nonInjected";
import { GnosisSafeWallet, CoinbaseWallet, WalletConnect } from "./classes/others";
import { isMobile } from "react-device-detect";

const injectWallet = new InjectedWallet("Inject", null, injectWalletIcon, "Inject Wallet", true, () => isMobile);
const metamask = new InjectedWallet(
  "Metamask",
  "https://metamask.io/",
  metamaskIcon,
  'Easy-to-use browser extension.',
  Boolean(window.ethereum && window.ethereum.isMetaMask),
);
const rabbyWallet = new InjectedWallet(
  "Rabby Wallet",
  "https://rabby.io/",
  rabbyIcon,
  'Easy-to-use browser extension.',
  Boolean(window.ethereum && window.ethereum.isRabby),
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
