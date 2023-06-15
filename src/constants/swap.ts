import { ChainId, JSBI, Percent, Token, WAVAX } from '@pangolindex/sdk';
import { DAIe, PNG, USDC, USDCe, USDTe } from './tokens';

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

export const BIPS_BASE = JSBI.BigInt(10000);

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE); // 15%
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.AVALANCHE]: {},
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
  [ChainId.SKALE_BELLATRIX_TESTNET]: {
    inputCurrency: WAVAX[ChainId.SKALE_BELLATRIX_TESTNET].address,
    outputCurrency: '',
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
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET], PNG[ChainId.EVMOS_TESTNET]],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET]],
  [ChainId.SKALE_BELLATRIX_TESTNET]: [WAVAX[ChainId.SKALE_BELLATRIX_TESTNET]],
};

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

export enum SwapTypes {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  TWAP = 'TWAP',
}
