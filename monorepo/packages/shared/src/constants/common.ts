import { ChainId, ChefType, Fraction, JSBI, Percent, Token, WAVAX } from '@pangolindex/sdk';
import BN from 'bn.js';
import { BigNumber } from 'ethers';
import { PNG } from './tokens';

export const BIG_INT_ZERO = JSBI.BigInt(0);
export const BIG_INT_TWO = JSBI.BigInt(2);
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7);
export const ONE_TOKEN = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

export const NetworkContextName = 'NETWORK';

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50;
// 10 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = '600';

export const RANGO_API_KEY = '6165008b-282e-446f-acf8-13c2b06d0775';
// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)); // .01 ETH
export type LogoSize = 24 | 48;

export const SQUID_API = 'https://api.0xsquid.com';
export const PANGOLIN_TOKENS_REPO_RAW_BASE_URL = `https://raw.githubusercontent.com/pangolindex/tokens`;
export const ANALYTICS_PAGE = 'https://info.pangolin.exchange';
export const PANGOLIN_API_BASE_URL = `https://api.pangolin.exchange`;
export const DIRECTUS_URL_NEWS = `https://pangolin.directus.app`;
export const OPEN_API_DEBANK = 'https://api.debank.com/';
export const LANDING_PAGE = 'https://pangolin.exchange';
export const NEAR_API_BASE_URL = `https://testnet-indexer.ref-finance.com`;
export const NEWS_API_URL = `https://pangolin.hasura.app/v1/graphql`;
export const ONE_YOCTO_NEAR = '0.000000000000000000000001';
export const NEAR_STORAGE_PER_TOKEN = '0.005';
export const NEAR_STORAGE_TO_REGISTER_WITH_FT = '0.1';
export const NEAR_MIN_DEPOSIT_PER_TOKEN = new BN('5000000000000000000000');
export const NEAR_MIN_DEPOSIT_PER_TOKEN_FARM = new BN('45000000000000000000000');
export const NEAR_ACCOUNT_MIN_STORAGE_AMOUNT = '0.005';
export const NEAR_LP_STORAGE_AMOUNT = '0.01';

export const ONLY_ZEROS = /^0*\.?0*$/;
export const BIGNUMBER_ZERO = BigNumber.from('0');
export const PANGOCHEF_COMPOUND_SLIPPAGE = new Fraction('1', '50'); // 2% of slippage tolerange
export const ZERO_FRACTION = new Fraction('0', '1');
export const ONE_FRACTION = new Fraction('1');

export const IS_IN_IFRAME = window.parent !== window;

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
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET], PNG[ChainId.EVMOS_TESTNET]],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET]],
  [ChainId.SKALE_BELLATRIX_TESTNET]: [WAVAX[ChainId.SKALE_BELLATRIX_TESTNET], PNG[ChainId.SKALE_BELLATRIX_TESTNET]],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WAVAX_AND_PNG_ONLY,
};

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.AVALANCHE]: [],
};

export interface MetamaskError {
  code: number;
  message: string;
}

export const FARM_TYPE: { [x: number]: string | undefined } = {
  1: ChefType.MINI_CHEF,
  2: ChefType.MINI_CHEF_V2,
  3: ChefType.PANGO_CHEF,
};
