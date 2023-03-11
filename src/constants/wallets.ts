/* eslint-disable max-lines */
import { ChainId } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import arrowRightIcon from 'src/assets/images/arrow-right.svg';
import avalancheCoreIcon from 'src/assets/images/avalancheCore.svg';
import bitKeepIcon from 'src/assets/images/bitkeep.svg';
import coinbaseWalletIcon from 'src/assets/images/coinbaseWalletIcon.png';
import gnosisSafeIcon from 'src/assets/images/gnosis_safe.png';
//import hashIcon from 'src/assets/images/hashConnect.png';
import metamaskIcon from 'src/assets/images/metamask.png';
import nearIcon from 'src/assets/images/near.svg';
import rabbyIcon from 'src/assets/images/rabby.svg';
import talismanIcon from 'src/assets/images/talisman.svg';
// import venlyIcon from 'src/assets/images/venly.png';
import walletConnectIcon from 'src/assets/images/walletConnectIcon.svg';
import xDefiIcon from 'src/assets/images/xDefi.png';
import {
  avalancheCore,
  bitKeep,
  gnosisSafe,
  //hashConnect,
  injected,
  near,
  talisman,
  // venly,
  walletconnect,
  walletlink,
  xDefi,
} from '../connectors';
import { CommonEVMProvider, HederaProvider, NearProvider } from '../connectors/WalletProviders';

export interface WalletInfo {
  connector?: AbstractConnector | any;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
  isEVM?: boolean;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: arrowRightIcon,
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
    isEVM: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: metamaskIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    isEVM: true,
  },
  GNOSISSAFE: {
    connector: gnosisSafe,
    name: 'Gnosis Safe',
    iconName: gnosisSafeIcon,
    description: 'Gnosis Safe Multisig Wallet.',
    href: null,
    color: '#010101',
    isEVM: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: coinbaseWalletIcon,
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5',
    isEVM: true,
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'Wallet Connect',
    iconName: walletConnectIcon,
    description: 'Use Wallet Connect',
    href: null,
    color: '#315CF5',
    isEVM: true,
  },
  XDEFI: {
    connector: xDefi,
    name: 'XDEFI Wallet',
    iconName: xDefiIcon,
    description: window.xfi && window.xfi.ethereum ? 'Easy-to-use browser extension.' : 'Please Install',
    href: null,
    color: '#315CF5',
    isEVM: true,
  },
  RABBY: {
    connector: injected,
    name: 'Rabby Wallet',
    iconName: rabbyIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#7a7cff',
    isEVM: true,
  },
  TALISMAN: {
    connector: talisman,
    name: 'Talisman',
    iconName: talismanIcon,
    description: 'Enter the Paraverse.',
    href: null,
    color: '#FF3D23',
    isEVM: true,
  },
  BITKEEP: {
    connector: bitKeep,
    name: 'BitKeep',
    iconName: bitKeepIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#7524f9',
    isEVM: true,
  },
  NEAR: {
    connector: near,
    name: 'Near',
    iconName: nearIcon,
    description: 'Near Web',
    href: null,
    color: '#315CF5',
    primary: true,
    isEVM: false,
  },
  // HASH_CONNECT: {
  //   connector: hashConnect,
  //   name: 'HashPack Wallet',
  //   iconName: hashIcon,
  //   description: 'HashPack Wallet Connect',
  //   href: null,
  //   color: '#7a7cff',
  //   primary: true,
  //   isEVM: true,
  // },
  // VENLY: {
  //   connector: venly,
  //   name: 'Venly Wallet',
  //   iconName: venlyIcon,
  //   description: 'Venly Wallet Connect',
  //   href: null,
  //   color: '#7735ea',
  //   primary: true,
  //   isEVM: true,
  // },
  AVALANCHECORE: {
    connector: avalancheCore,
    name: 'Avalanche Core Wallet',
    iconName: avalancheCoreIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    primary: true,
    isEVM: true,
  },
};

export const PROVIDER_MAPPING: { [chainId in ChainId]: (provider: any) => any } = {
  [ChainId.FUJI]: CommonEVMProvider,
  [ChainId.AVALANCHE]: CommonEVMProvider,
  [ChainId.WAGMI]: CommonEVMProvider,
  [ChainId.COSTON]: CommonEVMProvider,
  [ChainId.SONGBIRD]: CommonEVMProvider,
  [ChainId.FLARE_MAINNET]: CommonEVMProvider,
  [ChainId.HEDERA_TESTNET]: HederaProvider,
  [ChainId.HEDERA_MAINNET]: HederaProvider,
  [ChainId.NEAR_MAINNET]: NearProvider,
  [ChainId.NEAR_TESTNET]: NearProvider,
  [ChainId.COSTON2]: CommonEVMProvider,
  //TODO: remove this once we have proper implementation
  [ChainId.ETHEREUM]: CommonEVMProvider,
  [ChainId.POLYGON]: CommonEVMProvider,
  [ChainId.FANTOM]: CommonEVMProvider,
  [ChainId.XDAI]: CommonEVMProvider,
  [ChainId.BSC]: CommonEVMProvider,
  [ChainId.ARBITRUM]: CommonEVMProvider,
  [ChainId.CELO]: CommonEVMProvider,
  [ChainId.OKXCHAIN]: CommonEVMProvider,
  [ChainId.VELAS]: CommonEVMProvider,
  [ChainId.AURORA]: CommonEVMProvider,
  [ChainId.CRONOS]: CommonEVMProvider,
  [ChainId.FUSE]: CommonEVMProvider,
  [ChainId.MOONRIVER]: CommonEVMProvider,
  [ChainId.MOONBEAM]: CommonEVMProvider,
  [ChainId.OP]: CommonEVMProvider,
  [ChainId.EVMOS_TESTNET]: CommonEVMProvider,
  [ChainId.EVMOS_MAINNET]: CommonEVMProvider,
};

export const AVALANCHE_CHAIN_PARAMS = {
  chainId: '0xa86a', // A 0x-prefixed hexadecimal chainId
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io//'],
};
/* eslint-enable max-lines */
