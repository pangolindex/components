import { CHAINS, ChainId, JSBI, Percent, Token, WAVAX } from '@pangolindex/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { gnosisSafe, injected, walletconnect, walletlink, xDefi } from '../connectors';

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: CHAINS[ChainId.FUJI].contracts!.router,
  [ChainId.AVALANCHE]: CHAINS[ChainId.AVALANCHE].contracts!.router,
  [ChainId.WAGMI]: CHAINS[ChainId.WAGMI].contracts!.router,
  [ChainId.COSTON]: CHAINS[ChainId.COSTON].contracts!.router,
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

export const PNG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    CHAINS[ChainId.FUJI].contracts!.png,
    18,
    CHAINS[ChainId.FUJI].png_symbol!,
    'Pangolin',
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  ),
  [ChainId.WAGMI]: new Token(
    ChainId.WAGMI,
    CHAINS[ChainId.WAGMI].contracts!.png,
    18,
    CHAINS[ChainId.WAGMI].png_symbol!,
    'Wagmi Pangolin',
  ),
  [ChainId.COSTON]: new Token(
    ChainId.COSTON,
    CHAINS[ChainId.COSTON].contracts!.png,
    18,
    CHAINS[ChainId.COSTON].png_symbol!,
    'Coston Pangolin',
  ),
};

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
};

// these tokens can be directly linked to (via url params) in the swap page without prompting a warning
export const TRUSTED_TOKEN_ADDRESSES: { readonly [chainId in ChainId]: string[] } = {
  [ChainId.FUJI]: [],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE].address, PNG[ChainId.AVALANCHE].address],
  [ChainId.WAGMI]: [WAVAX[ChainId.WAGMI].address, PNG[ChainId.WAGMI].address],
  [ChainId.COSTON]: [WAVAX[ChainId.COSTON].address, PNG[ChainId.COSTON].address],
};

export const SWAP_DEFAULT_CURRENCY = {
  [ChainId.AVALANCHE]: {
    inputCurrency: 'AVAX',
    outputCurrency: '',
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

export const LANDING_PAGE = 'https://pangolin.exchange';

export const EVM_SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  GNOSISSAFE: {
    connector: gnosisSafe,
    name: 'Gnosis Safe',
    iconName: 'gnosis_safe.png',
    description: 'Gnosis Safe Multisig Wallet.',
    href: null,
    color: '#010101',
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'Wallet Connect',
    iconName: 'walletConnectIcon.svg',
    description: 'Use Wallet Connect',
    href: null,
    color: '#315CF5',
  },
  XDEFI: {
    connector: xDefi,
    name: 'XDEFI Wallet',
    iconName: 'xDefi.png',
    description: window.xfi && window.xfi.ethereum ? 'Easy-to-use browser extension.' : 'Please Install',
    href: null,
    color: '#315CF5',
  },
  RABBY: {
    connector: injected,
    name: 'Rabby Wallet',
    iconName: 'rabby.svg',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#7a7cff',
  },
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
  connector?: AbstractConnector;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}
export const DIRECTUS_URL_NEWS = `https://p7gm7mqi.directus.app/items/news?`;
