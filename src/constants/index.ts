/* eslint-disable max-lines */
import { CHAINS, ChainId, JSBI, Percent, Token, WAVAX } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import arrowRightIcon from 'src/assets/images/arrow-right.svg';
import coinbaseWalletIcon from 'src/assets/images/coinbaseWalletIcon.png';
import gnosisSafeIcon from 'src/assets/images/gnosis_safe.png';
import metamaskIcon from 'src/assets/images/metamask.png';
import nearIcon from 'src/assets/images/near.svg';
import rabbyIcon from 'src/assets/images/rabby.svg';
import walletConnectIcon from 'src/assets/images/walletConnectIcon.svg';
import xDefiIcon from 'src/assets/images/xDefi.png';
import avalancheCoreIcon from 'src/assets/images/avalancheCore.svg';
import { gnosisSafe, injected, near, walletconnect, walletlink, xDefi, avalancheCore } from '../connectors';
import { CommonEVMProvider, NearProvider } from '../connectors/WalletProviders';
import { PNG } from './tokens';

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: CHAINS[ChainId.FUJI].contracts!.router,
  [ChainId.AVALANCHE]: CHAINS[ChainId.AVALANCHE].contracts!.router,
  [ChainId.WAGMI]: CHAINS[ChainId.WAGMI].contracts!.router,
  [ChainId.COSTON]: CHAINS[ChainId.COSTON].contracts!.router,
  [ChainId.NEAR_MAINNET]: CHAINS[ChainId.NEAR_MAINNET]?.contracts!.router,
  [ChainId.NEAR_TESTNET]: CHAINS[ChainId.NEAR_TESTNET]?.contracts!.router,
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

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

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDT', 'Tether USD'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xde3A24028580884448a5397872046a019649b084',
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 6, 'USDT', 'Tether USD'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 6, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
};

export const USDTe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDT.e', 'Tether USD'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    6,
    'USDT.e',
    'Tether USD',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 6, 'USDT.e', 'Tether USD'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 6, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
};

export const UST: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'UST', 'Wormhole UST'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xb599c3590F42f8F995ECfa0f85D2980B76862fc1',
    6,
    'UST',
    'Wormhole UST',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 6, 'UST', 'Wormhole UST'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 6, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
};

export const axlUST: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'axlUST', 'Axelar Wrapped UST'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11',
    6,
    'axlUST',
    'Axelar Wrapped UST',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 18, 'axlUST', 'Axelar Wrapped UST'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
};

export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDC', 'USD Coin'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    6,
    'USDC',
    'USD Coin',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 6, 'USDC', 'USD Coin'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 6, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
};

export const USDCe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDC.e', 'USD Coin'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    6,
    'USDC.e',
    'USD Coin',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 6, 'USDC.e', 'USD Coin'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 6, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
};

// these tokens can be directly linked to (via url params) in the swap page without prompting a warning
export const TRUSTED_TOKEN_ADDRESSES: { readonly [chainId in ChainId]: string[] } = {
  [ChainId.FUJI]: [],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE].address, PNG[ChainId.AVALANCHE].address],
  [ChainId.WAGMI]: [WAVAX[ChainId.WAGMI].address, PNG[ChainId.WAGMI].address],
  [ChainId.COSTON]: [WAVAX[ChainId.COSTON].address, PNG[ChainId.COSTON].address],
  [ChainId.NEAR_MAINNET]: [WAVAX[ChainId.NEAR_MAINNET].address, PNG[ChainId.NEAR_MAINNET].address],
  [ChainId.NEAR_TESTNET]: [WAVAX[ChainId.NEAR_TESTNET].address, PNG[ChainId.NEAR_TESTNET].address],
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
  [ChainId.NEAR_MAINNET]: {
    inputCurrency: WAVAX[ChainId.NEAR_MAINNET].address,
    outputCurrency: PNG[ChainId.NEAR_MAINNET].address,
  },
  [ChainId.NEAR_TESTNET]: {
    inputCurrency: WAVAX[ChainId.NEAR_TESTNET].address,
    outputCurrency: PNG[ChainId.NEAR_TESTNET].address,
  },
};

export const DAIe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'DAI.e', 'Dai Stablecoin'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    18,
    'DAI.e',
    'Dai Stablecoin',
  ),
  [ChainId.WAGMI]: new Token(ChainId.WAGMI, ZERO_ADDRESS, 18, 'DAI.e', 'Dai Stablecoin'),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 18, '', ''),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 18, '', ''),
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
  [ChainId.NEAR_MAINNET]: [WAVAX[ChainId.NEAR_MAINNET], PNG[ChainId.NEAR_MAINNET]],
  [ChainId.NEAR_TESTNET]: [WAVAX[ChainId.NEAR_TESTNET], PNG[ChainId.NEAR_TESTNET]],
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
  AVALANCHECORE: {
    connector: avalancheCore,
    name: 'Avalanche Core Wallet',
    iconName: avalancheCoreIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    isEVM: true,
  },
};

export const PROVIDER_MAPPING = {
  INJECTED: CommonEVMProvider,
  METAMASK: CommonEVMProvider,
  WALLET_LINK: CommonEVMProvider,
  XDEFI: CommonEVMProvider,
  GNOSISSAFE: CommonEVMProvider,
  WALLET_CONNECT: CommonEVMProvider,
  RABBY: CommonEVMProvider,
  AVALANCHECORE: CommonEVMProvider,
  NEAR: NearProvider,
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
export const DIRECTUS_URL_NEWS = `https://p7gm7mqi.directus.app/items/news?`;

export const COINGEKO_BASE_URL = `https://api.coingecko.com/api/v3/`;

export const OPEN_API_DEBANK = 'https://openapi.debank.com/v1/user';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

/* eslint-enable max-lines */
