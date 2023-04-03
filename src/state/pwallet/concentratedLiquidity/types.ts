import { Token } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';

export interface UseV3PositionResults {
  loading: boolean;
  position: PositionDetails | undefined;
}

export interface UseV3PositionsResults {
  loading: boolean;
  positions: PositionDetails[] | undefined;
}

export interface PositionDetails {
  nonce?: BigNumber;
  tokenId: BigNumber;
  operator?: string;
  token0: Token;
  token1: Token;
  fee: number;
  tickLower?: number;
  tickUpper?: number;
  liquidity: BigNumber;
  feeGrowthInside0LastX128?: BigNumber;
  feeGrowthInside1LastX128?: BigNumber;
  tokensOwed0?: BigNumber;
  tokensOwed1?: BigNumber;
}
