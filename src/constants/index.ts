/* eslint-disable max-lines */
import { CHAINS, ChainId, ChefType, Fraction, JSBI, Percent, StakingType, Token, WAVAX } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import BN from 'bn.js';
import { BigNumber } from 'ethers';
import arrowRightIcon from 'src/assets/images/arrow-right.svg';
import avalancheCoreIcon from 'src/assets/images/avalancheCore.svg';
import bitKeepIcon from 'src/assets/images/bitkeep.svg';
import coinbaseWalletIcon from 'src/assets/images/coinbaseWalletIcon.png';
import gnosisSafeIcon from 'src/assets/images/gnosis_safe.png';
import hashIcon from 'src/assets/images/hashConnect.png';
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
  hashConnect,
  injected,
  near,
  talisman,
  // venly,
  walletconnect,
  walletlink,
  xDefi,
} from '../connectors';
import { CommonEVMProvider, HederaProvider, NearProvider } from '../connectors/WalletProviders';
import { DAIe, PNG, USDC, USDCe, USDTe, UST, axlUST } from './tokens';

export const BIG_INT_ZERO = JSBI.BigInt(0);
export const BIG_INT_TWO = JSBI.BigInt(2);
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7);
export const ONE_TOKEN = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: CHAINS[ChainId.FUJI].contracts!.router,
  [ChainId.AVALANCHE]: CHAINS[ChainId.AVALANCHE].contracts!.router,
  [ChainId.WAGMI]: CHAINS[ChainId.WAGMI].contracts!.router,
  [ChainId.COSTON]: CHAINS[ChainId.COSTON].contracts!.router,
  [ChainId.SONGBIRD]: CHAINS[ChainId.SONGBIRD].contracts!.router,
  [ChainId.FLARE_MAINNET]: CHAINS[ChainId.FLARE_MAINNET].contracts!.router,
  [ChainId.HEDERA_TESTNET]: CHAINS[ChainId.HEDERA_TESTNET].contracts!.router,
  [ChainId.HEDERA_MAINNET]: CHAINS[ChainId.HEDERA_MAINNET].contracts!.router,
  [ChainId.NEAR_MAINNET]: CHAINS[ChainId.NEAR_MAINNET]?.contracts!.router,
  [ChainId.NEAR_TESTNET]: CHAINS[ChainId.NEAR_TESTNET]?.contracts!.router,
  [ChainId.COSTON2]: CHAINS[ChainId.COSTON2].contracts!.router,
  [ChainId.EVMOS_TESTNET]: CHAINS[ChainId.EVMOS_TESTNET].contracts!.router,
  [ChainId.EVMOS_MAINNET]: CHAINS[ChainId.EVMOS_MAINNET].contracts!.router,
  [ChainId.ZKSYNC_TESTNET]: CHAINS[ChainId.ZKSYNC_TESTNET].contracts!.router,
  [ChainId.ETHEREUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
};

export const ROUTER_DAAS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: CHAINS[ChainId.FUJI]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.AVALANCHE]: CHAINS[ChainId.AVALANCHE]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.WAGMI]: CHAINS[ChainId.WAGMI]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.COSTON]: CHAINS[ChainId.COSTON]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.SONGBIRD]: CHAINS[ChainId.SONGBIRD]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.FLARE_MAINNET]: CHAINS[ChainId.FLARE_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.HEDERA_TESTNET]: CHAINS[ChainId.HEDERA_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.HEDERA_MAINNET]: CHAINS[ChainId.HEDERA_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.NEAR_MAINNET]: CHAINS[ChainId.NEAR_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.NEAR_TESTNET]: CHAINS[ChainId.NEAR_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.COSTON2]: CHAINS[ChainId.COSTON2]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.EVMOS_TESTNET]: CHAINS[ChainId.EVMOS_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.EVMOS_MAINNET]: CHAINS[ChainId.EVMOS_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.ZKSYNC_TESTNET]: CHAINS[ChainId.ZKSYNC_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.ETHEREUM]: ZERO_ADDRESS,
  [ChainId.POLYGON]: ZERO_ADDRESS,
  [ChainId.FANTOM]: ZERO_ADDRESS,
  [ChainId.XDAI]: ZERO_ADDRESS,
  [ChainId.BSC]: ZERO_ADDRESS,
  [ChainId.ARBITRUM]: ZERO_ADDRESS,
  [ChainId.CELO]: ZERO_ADDRESS,
  [ChainId.OKXCHAIN]: ZERO_ADDRESS,
  [ChainId.VELAS]: ZERO_ADDRESS,
  [ChainId.AURORA]: ZERO_ADDRESS,
  [ChainId.CRONOS]: ZERO_ADDRESS,
  [ChainId.FUSE]: ZERO_ADDRESS,
  [ChainId.MOONRIVER]: ZERO_ADDRESS,
  [ChainId.MOONBEAM]: ZERO_ADDRESS,
  [ChainId.OP]: ZERO_ADDRESS,
};

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.AVALANCHE]: {},
};

export const NetworkContextName = 'NETWORK';

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50;
// 10 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = '600';

const getMiniChefAddress = (chainId: ChainId) => {
  const minichefObj = CHAINS[chainId].contracts?.mini_chef;
  if (minichefObj?.type === ChefType.MINI_CHEF_V2) {
    return minichefObj.address;
  }
  return undefined;
};

export const SQUID_API = 'https://api.0xsquid.com';
export const RANGO_API_KEY = '6165008b-282e-446f-acf8-13c2b06d0775';

export const MINICHEF_ADDRESS: { [chainId in ChainId]: string | undefined } = {
  [ChainId.FUJI]: getMiniChefAddress(ChainId.FUJI),
  [ChainId.AVALANCHE]: getMiniChefAddress(ChainId.AVALANCHE),
  [ChainId.WAGMI]: getMiniChefAddress(ChainId.WAGMI),
  [ChainId.COSTON]: getMiniChefAddress(ChainId.COSTON),
  [ChainId.SONGBIRD]: getMiniChefAddress(ChainId.SONGBIRD),
  [ChainId.FLARE_MAINNET]: getMiniChefAddress(ChainId.FLARE_MAINNET),
  [ChainId.HEDERA_TESTNET]: getMiniChefAddress(ChainId.HEDERA_TESTNET),
  [ChainId.HEDERA_MAINNET]: getMiniChefAddress(ChainId.HEDERA_MAINNET),
  [ChainId.NEAR_MAINNET]: getMiniChefAddress(ChainId.NEAR_MAINNET),
  [ChainId.NEAR_TESTNET]: getMiniChefAddress(ChainId.NEAR_TESTNET),
  [ChainId.COSTON2]: getMiniChefAddress(ChainId.COSTON2),
  [ChainId.EVMOS_TESTNET]: getMiniChefAddress(ChainId.EVMOS_TESTNET),
  [ChainId.EVMOS_MAINNET]: undefined,
  [ChainId.ZKSYNC_TESTNET]: getMiniChefAddress(ChainId.ZKSYNC_TESTNET),
  [ChainId.ETHEREUM]: undefined,
  [ChainId.POLYGON]: undefined,
  [ChainId.FANTOM]: undefined,
  [ChainId.XDAI]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.ARBITRUM]: undefined,
  [ChainId.CELO]: undefined,
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: undefined,
  [ChainId.CRONOS]: undefined,
  [ChainId.FUSE]: undefined,
  [ChainId.MOONRIVER]: undefined,
  [ChainId.MOONBEAM]: undefined,
  [ChainId.OP]: undefined,
};

const getPangoChefAddress = (chainId: ChainId) => {
  const minichefObj = CHAINS[chainId].contracts?.mini_chef;
  if (minichefObj?.type === ChefType.PANGO_CHEF) {
    return minichefObj.address;
  }
  return undefined;
};

export const PANGOCHEF_ADDRESS: { [chainId in ChainId]: string | undefined } = {
  [ChainId.FUJI]: getPangoChefAddress(ChainId.FUJI),
  [ChainId.AVALANCHE]: getPangoChefAddress(ChainId.AVALANCHE),
  [ChainId.WAGMI]: getPangoChefAddress(ChainId.WAGMI),
  [ChainId.COSTON]: getPangoChefAddress(ChainId.COSTON),
  [ChainId.SONGBIRD]: getPangoChefAddress(ChainId.SONGBIRD),
  [ChainId.FLARE_MAINNET]: getPangoChefAddress(ChainId.FLARE_MAINNET),
  [ChainId.HEDERA_TESTNET]: getPangoChefAddress(ChainId.HEDERA_TESTNET),
  [ChainId.HEDERA_MAINNET]: getPangoChefAddress(ChainId.HEDERA_MAINNET),
  [ChainId.NEAR_MAINNET]: undefined,
  [ChainId.NEAR_TESTNET]: undefined,
  [ChainId.COSTON2]: getPangoChefAddress(ChainId.COSTON2),
  [ChainId.EVMOS_TESTNET]: getPangoChefAddress(ChainId.EVMOS_TESTNET),
  [ChainId.EVMOS_MAINNET]: undefined,
  [ChainId.ZKSYNC_TESTNET]: getPangoChefAddress(ChainId.ZKSYNC_TESTNET),
  [ChainId.ETHEREUM]: undefined,
  [ChainId.POLYGON]: undefined,
  [ChainId.FANTOM]: undefined,
  [ChainId.XDAI]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.ARBITRUM]: undefined,
  [ChainId.CELO]: undefined,
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: undefined,
  [ChainId.CRONOS]: undefined,
  [ChainId.FUSE]: undefined,
  [ChainId.MOONRIVER]: undefined,
  [ChainId.MOONBEAM]: undefined,
  [ChainId.OP]: undefined,
};

// these tokens can be directly linked to (via url params) in the swap page without prompting a warning
export const TRUSTED_TOKEN_ADDRESSES: { readonly [chainId in ChainId]: string[] } = {
  [ChainId.FUJI]: [],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE].address, PNG[ChainId.AVALANCHE].address],
  [ChainId.WAGMI]: [WAVAX[ChainId.WAGMI].address, PNG[ChainId.WAGMI].address],
  [ChainId.COSTON]: [WAVAX[ChainId.COSTON].address, PNG[ChainId.COSTON].address],
  [ChainId.SONGBIRD]: [WAVAX[ChainId.SONGBIRD].address, PNG[ChainId.SONGBIRD].address],
  [ChainId.FLARE_MAINNET]: [WAVAX[ChainId.FLARE_MAINNET].address, PNG[ChainId.FLARE_MAINNET].address],
  [ChainId.HEDERA_TESTNET]: [WAVAX[ChainId.HEDERA_TESTNET].address, PNG[ChainId.HEDERA_TESTNET].address],
  [ChainId.HEDERA_MAINNET]: [WAVAX[ChainId.HEDERA_MAINNET].address, PNG[ChainId.HEDERA_MAINNET].address],
  [ChainId.NEAR_MAINNET]: [WAVAX[ChainId.NEAR_MAINNET].address, PNG[ChainId.NEAR_MAINNET].address],
  [ChainId.NEAR_TESTNET]: [WAVAX[ChainId.NEAR_TESTNET].address, PNG[ChainId.NEAR_TESTNET].address],
  [ChainId.COSTON2]: [WAVAX[ChainId.COSTON2].address, PNG[ChainId.COSTON2].address],
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET].address, PNG[ChainId.EVMOS_TESTNET].address],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET].address],
  [ChainId.ZKSYNC_TESTNET]: [WAVAX[ChainId.ZKSYNC_TESTNET].address, PNG[ChainId.ZKSYNC_TESTNET].address],
  [ChainId.ETHEREUM]: [],
  [ChainId.POLYGON]: [],
  [ChainId.FANTOM]: [],
  [ChainId.XDAI]: [],
  [ChainId.BSC]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.CELO]: [],
  [ChainId.OKXCHAIN]: [],
  [ChainId.VELAS]: [],
  [ChainId.AURORA]: [],
  [ChainId.CRONOS]: [],
  [ChainId.FUSE]: [],
  [ChainId.MOONRIVER]: [],
  [ChainId.MOONBEAM]: [],
  [ChainId.OP]: [],
};

export const SWAP_DEFAULT_CURRENCY = {
  [ChainId.AVALANCHE]: {
    inputCurrency: 'AVAX',
    outputCurrency: USDC[ChainId.AVALANCHE].address,
  },
  [ChainId.FUJI]: {
    inputCurrency: '',
    outputCurrency: '',
  },
  [ChainId.WAGMI]: {
    inputCurrency: '',
    outputCurrency: '',
  },
  [ChainId.COSTON]: {
    inputCurrency: '',
    outputCurrency: '',
  },
  [ChainId.SONGBIRD]: {
    inputCurrency: 'SGB',
    outputCurrency: PNG[ChainId.SONGBIRD].address,
  },
  [ChainId.FLARE_MAINNET]: {
    inputCurrency: 'FLR',
    outputCurrency: '',
  },
  [ChainId.HEDERA_TESTNET]: {
    inputCurrency: 'HBAR',
    outputCurrency: WAVAX[ChainId.HEDERA_TESTNET].address,
  },
  [ChainId.HEDERA_MAINNET]: {
    inputCurrency: 'HBAR',
    outputCurrency: PNG[ChainId.HEDERA_MAINNET].address,
  },
  [ChainId.NEAR_MAINNET]: {
    inputCurrency: WAVAX[ChainId.NEAR_MAINNET].address,
    outputCurrency: PNG[ChainId.NEAR_MAINNET].address,
  },
  [ChainId.NEAR_TESTNET]: {
    inputCurrency: WAVAX[ChainId.NEAR_TESTNET].address,
    outputCurrency: PNG[ChainId.NEAR_TESTNET].address,
  },
  [ChainId.COSTON2]: {
    inputCurrency: 'C2FLR',
    outputCurrency: PNG[ChainId.COSTON2].address,
  },
  [ChainId.EVMOS_TESTNET]: {
    inputCurrency: 'tEVMOS',
    outputCurrency: PNG[ChainId.EVMOS_TESTNET].address,
  },
  [ChainId.EVMOS_MAINNET]: {
    inputCurrency: 'EVMOS',
    outputCurrency: '',
  },
  [ChainId.ZKSYNC_TESTNET]: {
    inputCurrency: 'ETH',
    outputCurrency: PNG[ChainId.ZKSYNC_TESTNET].address,
  },
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.FUJI]: [WAVAX[ChainId.FUJI], PNG[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [
    WAVAX[ChainId.AVALANCHE],
    PNG[ChainId.AVALANCHE],
    USDTe[ChainId.AVALANCHE],
    DAIe[ChainId.AVALANCHE],
    USDCe[ChainId.AVALANCHE],
    UST[ChainId.AVALANCHE],
    axlUST[ChainId.AVALANCHE],
    USDC[ChainId.AVALANCHE],
  ],
  [ChainId.WAGMI]: [WAVAX[ChainId.WAGMI], PNG[ChainId.WAGMI]],
  [ChainId.COSTON]: [WAVAX[ChainId.COSTON], PNG[ChainId.COSTON]],
  [ChainId.SONGBIRD]: [WAVAX[ChainId.SONGBIRD], PNG[ChainId.SONGBIRD]],
  [ChainId.FLARE_MAINNET]: [WAVAX[ChainId.FLARE_MAINNET], PNG[ChainId.FLARE_MAINNET]],
  [ChainId.HEDERA_TESTNET]: [WAVAX[ChainId.HEDERA_TESTNET], PNG[ChainId.HEDERA_TESTNET]],
  [ChainId.HEDERA_MAINNET]: [
    WAVAX[ChainId.HEDERA_MAINNET],
    PNG[ChainId.HEDERA_MAINNET],
    USDTe[ChainId.HEDERA_MAINNET],
    USDC[ChainId.HEDERA_MAINNET],
  ],
  [ChainId.NEAR_MAINNET]: [WAVAX[ChainId.NEAR_MAINNET], PNG[ChainId.NEAR_MAINNET]],
  [ChainId.NEAR_TESTNET]: [WAVAX[ChainId.NEAR_TESTNET], PNG[ChainId.NEAR_TESTNET]],
  [ChainId.COSTON2]: [WAVAX[ChainId.COSTON2], PNG[ChainId.COSTON2]],
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET], PNG[ChainId.EVMOS_TESTNET]],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET]],
  [ChainId.ZKSYNC_TESTNET]: [WAVAX[ChainId.ZKSYNC_TESTNET], PNG[ChainId.ZKSYNC_TESTNET]],
  [ChainId.ETHEREUM]: [],
  [ChainId.POLYGON]: [],
  [ChainId.FANTOM]: [],
  [ChainId.XDAI]: [],
  [ChainId.BSC]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.CELO]: [],
  [ChainId.OKXCHAIN]: [],
  [ChainId.VELAS]: [],
  [ChainId.AURORA]: [],
  [ChainId.CRONOS]: [],
  [ChainId.FUSE]: [],
  [ChainId.MOONRIVER]: [],
  [ChainId.MOONBEAM]: [],
  [ChainId.OP]: [],
};

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));
export const BIPS_BASE = JSBI.BigInt(10000);

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE); // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)); // .01 ETH

export const PANGOLIN_TOKENS_REPO_RAW_BASE_URL = `https://raw.githubusercontent.com/pangolindex/tokens`;

export type LogoSize = 24 | 48;

export const ANALYTICS_PAGE = 'https://info.pangolin.exchange';
export const PANGOLIN_API_BASE_URL = `https://api.pangolin.exchange`;
export const TIMEFRAME = [
  {
    description: 'DAY',
    label: '1D',
    interval: 3600,
    momentIdentifier: 'day',
    days: '1',
  },
  {
    description: 'WEEK',
    label: '1W',
    interval: 86400,
    momentIdentifier: 'week',
    days: '7',
  },
  {
    description: 'MONTH',
    label: '1M',
    interval: 604800,
    momentIdentifier: 'month',
    days: '30',
  },
  {
    description: 'YEAR',
    label: '1Y',
    interval: 2629746,
    momentIdentifier: 'year',
    days: '365',
  },
  {
    description: 'ALL',
    label: 'ALL',
    interval: 2629746,
    momentIdentifier: '',
    days: 'max',
  },
];

export const SUBGRAPH_BASE_URL = `https://api.thegraph.com/subgraphs/name/pangolindex`;

export const LANDING_PAGE = 'https://pangolin.exchange';

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
  HASH_CONNECT: {
    connector: hashConnect,
    name: 'HashPack Wallet',
    iconName: hashIcon,
    description: 'HashPack Wallet Connect',
    href: null,
    color: '#7a7cff',
    primary: true,
    isEVM: true,
  },
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
  [ChainId.EVMOS_TESTNET]: CommonEVMProvider,
  [ChainId.EVMOS_MAINNET]: CommonEVMProvider,
  [ChainId.ZKSYNC_TESTNET]: CommonEVMProvider,
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
export const IS_IN_IFRAME = window.parent !== window;

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
export const DIRECTUS_URL_NEWS = `https://pangolin.directus.app`;

export const COINGEKO_BASE_URL = `https://api.coingecko.com/api/v3`;
export const NEAR_API_BASE_URL = `https://testnet-indexer.ref-finance.com`;

export const OPEN_API_DEBANK = 'https://api.debank.com/';
export const ONE_YOCTO_NEAR = '0.000000000000000000000001';
export const NEAR_STORAGE_PER_TOKEN = '0.005';
export const NEAR_STORAGE_TO_REGISTER_WITH_FT = '0.1';
export const NEAR_MIN_DEPOSIT_PER_TOKEN = new BN('5000000000000000000000');
export const NEAR_MIN_DEPOSIT_PER_TOKEN_FARM = new BN('45000000000000000000000');
export const NEAR_ACCOUNT_MIN_STORAGE_AMOUNT = '0.005';
export const NEAR_LP_STORAGE_AMOUNT = '0.01';
export const ONLY_ZEROS = /^0*\.?0*$/;

const WAVAX_AND_PNG_ONLY: ChainTokenList = {
  [ChainId.FUJI]: [WAVAX[ChainId.FUJI], PNG[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
  [ChainId.WAGMI]: [WAVAX[ChainId.WAGMI], PNG[ChainId.WAGMI]],
  [ChainId.COSTON]: [WAVAX[ChainId.COSTON], PNG[ChainId.COSTON]],
  [ChainId.SONGBIRD]: [WAVAX[ChainId.SONGBIRD], PNG[ChainId.SONGBIRD]],
  [ChainId.FLARE_MAINNET]: [WAVAX[ChainId.FLARE_MAINNET], PNG[ChainId.FLARE_MAINNET]],
  [ChainId.HEDERA_TESTNET]: [WAVAX[ChainId.HEDERA_TESTNET], PNG[ChainId.HEDERA_TESTNET]],
  [ChainId.HEDERA_MAINNET]: [WAVAX[ChainId.HEDERA_MAINNET], PNG[ChainId.HEDERA_MAINNET]],
  [ChainId.NEAR_MAINNET]: [WAVAX[ChainId.NEAR_MAINNET], PNG[ChainId.NEAR_MAINNET]],
  [ChainId.NEAR_TESTNET]: [WAVAX[ChainId.NEAR_TESTNET], PNG[ChainId.NEAR_TESTNET]],
  [ChainId.COSTON2]: [WAVAX[ChainId.COSTON2], PNG[ChainId.COSTON2]],
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET], PNG[ChainId.EVMOS_TESTNET]],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET]],
  [ChainId.ZKSYNC_TESTNET]: [WAVAX[ChainId.ZKSYNC_TESTNET], PNG[ChainId.ZKSYNC_TESTNET]],
  [ChainId.POLYGON]: [],
  [ChainId.ETHEREUM]: [],
  [ChainId.FANTOM]: [],
  [ChainId.XDAI]: [],
  [ChainId.BSC]: [],
  [ChainId.ARBITRUM]: [],
  [ChainId.CELO]: [],
  [ChainId.OKXCHAIN]: [],
  [ChainId.VELAS]: [],
  [ChainId.AURORA]: [],
  [ChainId.CRONOS]: [],
  [ChainId.FUSE]: [],
  [ChainId.MOONRIVER]: [],
  [ChainId.MOONBEAM]: [],
  [ChainId.OP]: [],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WAVAX_AND_PNG_ONLY,
};

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.AVALANCHE]: [],
};

const getSarAddress = (chainId: ChainId) => {
  return CHAINS[chainId]?.contracts?.staking?.find((c) => c.type === StakingType.SAR_POSITIONS && c.active)?.address;
};

export const SAR_STAKING_ADDRESS: { [chainId in ChainId]: string | undefined } = {
  [ChainId.FUJI]: getSarAddress(ChainId.FUJI),
  [ChainId.AVALANCHE]: getSarAddress(ChainId.AVALANCHE),
  [ChainId.WAGMI]: getSarAddress(ChainId.WAGMI),
  [ChainId.COSTON]: getSarAddress(ChainId.COSTON),
  [ChainId.SONGBIRD]: getSarAddress(ChainId.SONGBIRD),
  [ChainId.FLARE_MAINNET]: getSarAddress(ChainId.FLARE_MAINNET),
  [ChainId.HEDERA_TESTNET]: getSarAddress(ChainId.HEDERA_TESTNET),
  [ChainId.HEDERA_MAINNET]: getSarAddress(ChainId.HEDERA_MAINNET),
  [ChainId.NEAR_MAINNET]: getSarAddress(ChainId.NEAR_MAINNET),
  [ChainId.NEAR_TESTNET]: getSarAddress(ChainId.NEAR_TESTNET),
  [ChainId.COSTON2]: getSarAddress(ChainId.COSTON2),
  [ChainId.EVMOS_TESTNET]: getSarAddress(ChainId.EVMOS_TESTNET),
  [ChainId.EVMOS_MAINNET]: undefined,
  [ChainId.ZKSYNC_TESTNET]: getSarAddress(ChainId.ZKSYNC_TESTNET),
  [ChainId.ETHEREUM]: undefined,
  [ChainId.POLYGON]: undefined,
  [ChainId.FANTOM]: undefined,
  [ChainId.XDAI]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.ARBITRUM]: undefined,
  [ChainId.CELO]: undefined,
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: undefined,
  [ChainId.CRONOS]: undefined,
  [ChainId.FUSE]: undefined,
  [ChainId.MOONRIVER]: undefined,
  [ChainId.MOONBEAM]: undefined,
  [ChainId.OP]: undefined,
};
/* eslint-enable max-lines */

export enum SwapTypes {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  TWAP = 'TWAP',
}

export interface MetamaskError {
  code: number;
  message: string;
}
export const BIGNUMBER_ZERO = BigNumber.from('0');

export const PANGOCHEF_COMPOUND_SLIPPAGE = new Fraction('1', '50'); // 2% of slippage tolerange
export const ONE_FRACTION = new Fraction('1');

export const COINGECKO_CURRENCY_ID: { [chainId in ChainId]: string | undefined } = {
  [ChainId.FUJI]: undefined,
  [ChainId.AVALANCHE]: 'avalanche-2',
  [ChainId.WAGMI]: undefined,
  [ChainId.COSTON]: undefined,
  [ChainId.SONGBIRD]: 'songbird',
  [ChainId.FLARE_MAINNET]: 'flare-networks',
  [ChainId.HEDERA_TESTNET]: 'hedera-hashgraph',
  [ChainId.HEDERA_MAINNET]: 'hedera-hashgraph',
  [ChainId.NEAR_MAINNET]: 'near',
  [ChainId.NEAR_TESTNET]: undefined,
  [ChainId.COSTON2]: undefined,
  [ChainId.EVMOS_TESTNET]: undefined,
  [ChainId.EVMOS_MAINNET]: undefined,
  [ChainId.ZKSYNC_TESTNET]: undefined,
  [ChainId.ETHEREUM]: undefined,
  [ChainId.POLYGON]: undefined,
  [ChainId.FANTOM]: undefined,
  [ChainId.XDAI]: undefined,
  [ChainId.BSC]: undefined,
  [ChainId.ARBITRUM]: undefined,
  [ChainId.CELO]: undefined,
  [ChainId.OKXCHAIN]: undefined,
  [ChainId.VELAS]: undefined,
  [ChainId.AURORA]: undefined,
  [ChainId.CRONOS]: undefined,
  [ChainId.FUSE]: undefined,
  [ChainId.MOONRIVER]: undefined,
  [ChainId.MOONBEAM]: undefined,
  [ChainId.OP]: undefined,
};

export const FARM_TYPE: { [x: number]: string | undefined } = {
  1: ChefType.MINI_CHEF,
  2: ChefType.MINI_CHEF_V2,
  3: ChefType.PANGO_CHEF,
};
