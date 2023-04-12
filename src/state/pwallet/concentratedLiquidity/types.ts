import { FeeAmount } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { TokenReturnType } from 'src/hooks/tokens/constant';

export interface PositionDetails {
  nonce?: BigNumber;
  tokenId: BigNumber;
  operator?: string;
  token0: TokenReturnType;
  token1: TokenReturnType;
  fee: FeeAmount;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  feeGrowthInside0LastX128?: BigNumber;
  feeGrowthInside1LastX128?: BigNumber;
  tokensOwed0?: BigNumber;
  tokensOwed1?: BigNumber;
}

export type PositionDetailsFromChain = PositionDetails & {
  token0: string;
  token1: string;
  fee: number;
};

export interface UseConcentratedPositionResults {
  loading: boolean;
  position: PositionDetailsFromChain | undefined;
}

export interface UseConcentratedPositionsResults {
  loading: boolean;
  positions: PositionDetailsFromChain[] | undefined;
}
