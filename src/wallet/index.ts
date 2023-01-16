import { AvalancheCoreWallet, BitKeepWallet, InjectedWallet, TalismanWallet } from "./classes/injected";
import { Wallet } from "./classes/wallet";
import injectWallet from 'src/assets/images/inject-wallet.svg';
import metamaskIcon from 'src/assets/images/metamask.png';
import rabbyIcon from 'src/assets/images/rabby.svg';
import { HashPackWallet, NearWallet, XDefiWallet } from "./classes/nonInjected";
import { GnosisSafeWallet, CoinbaseWallet, WalletConnect } from "./classes/others";

export const SUPPORTED_WALLETS: { [key: string]: Wallet } = {
  INJECTED: new InjectedWallet("Inject", null, injectWallet, "Inject Wallet"),
  METAMASK: new InjectedWallet(
    "Metamask",
    "https://metamask.io/",
    metamaskIcon,
    'Easy-to-use browser extension.',
    Boolean(window.ethereum && window.ethereum.isMetaMask),
  ),
  RABBY: new InjectedWallet(
    "Rabby Wallet",
    "https://rabby.io/",
    rabbyIcon,
    'Easy-to-use browser extension.',
    Boolean(window.ethereum && window.ethereum.isRabby),
  ),
  TALISMAN: new TalismanWallet(),
  BITKEEP: new BitKeepWallet(),
  AVALANCHECORE: new AvalancheCoreWallet(),
  XDEFI: new XDefiWallet(),
  NEAR: new NearWallet(),
  HASH_CONNECT: new HashPackWallet(),
  GNOSISSAFE: new GnosisSafeWallet(),
  WALLET_LINK: new CoinbaseWallet(),
  WALLET_CONNECT: new WalletConnect(),
};
