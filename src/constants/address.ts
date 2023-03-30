/* eslint-disable max-lines */
import { CHAINS, ChainId, ChefType, StakingType, WAVAX } from '@pangolindex/sdk';
import { PNG } from './tokens';
import { ZERO_ADDRESS } from '.';

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
  [ChainId.EVMOS_TESTNET]: CHAINS[ChainId.EVMOS_TESTNET].contracts!.router,
  [ChainId.EVMOS_MAINNET]: CHAINS[ChainId.EVMOS_MAINNET].contracts!.router,
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
  [ChainId.EVMOS_TESTNET]: CHAINS[ChainId.EVMOS_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.EVMOS_MAINNET]: CHAINS[ChainId.EVMOS_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
};

const getMiniChefAddress = (chainId: ChainId) => {
  const minichefObj = CHAINS[chainId].contracts?.mini_chef;
  if (minichefObj?.type === ChefType.MINI_CHEF_V2) {
    return minichefObj.address;
  }
  return undefined;
};

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
  [ChainId.EVMOS_TESTNET]: getMiniChefAddress(ChainId.EVMOS_TESTNET),
  [ChainId.EVMOS_MAINNET]: undefined,
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
  [ChainId.EVMOS_TESTNET]: getPangoChefAddress(ChainId.EVMOS_TESTNET),
  [ChainId.EVMOS_MAINNET]: undefined,
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
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET].address, PNG[ChainId.EVMOS_TESTNET].address],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET].address],
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
  [ChainId.EVMOS_TESTNET]: getSarAddress(ChainId.EVMOS_TESTNET),
  [ChainId.EVMOS_MAINNET]: undefined,
};

/* eslint-enable max-lines */
