import { Token } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';

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
export interface UseConcentratedPositionResults {
  loading: boolean;
  position: PositionDetails | undefined;
}

export interface UseConcentratedPositionsResults {
  loading: boolean;
  positions: PositionDetails[] | undefined;
}
