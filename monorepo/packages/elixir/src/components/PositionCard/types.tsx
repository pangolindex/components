import { FeeAmount } from '@pangolindex/sdk';
import { TokenReturnType } from '@pangolindex/state-hooks';
import { BigNumber } from 'ethers';

export type PositionCardProps = {
  token0: TokenReturnType;
  token1: TokenReturnType;
  feeAmount: FeeAmount;
  tokenId: BigNumber;
  liquidity: BigNumber;
  tickLower: number;
  tickUpper: number;
  onClick: () => void;
};
