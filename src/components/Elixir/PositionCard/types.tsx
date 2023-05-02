import { FeeAmount } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { TokenReturnType } from 'src/hooks/tokens/constant';

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
