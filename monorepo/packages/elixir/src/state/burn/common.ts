import { Percent, Position, Token, TokenAmount } from '@pangolindex/sdk';
import { unwrappedToken, useChainId } from '@pangolindex/shared';
import { useTokenHook } from '@pangolindex/state-hooks';
import { useConcLiqPositionFeesHook } from 'src/hooks';
import { useDerivedPositionInfo } from 'src/state/wallet/hooks/evm';
import { PositionDetails } from 'src/state/wallet/types';

export function useDerivedBurnInfo(
  position?: PositionDetails,
  percent = 0,
): {
  position?: Position;
  liquidityPercentage?: Percent;
  liquidityValue0?: TokenAmount;
  liquidityValue1?: TokenAmount;
  feeValue0?: TokenAmount;
  feeValue1?: TokenAmount;
  outOfRange: boolean;
  removed?: boolean;
} {
  const chainId = useChainId();

  const useToken = useTokenHook[chainId];
  const token0 = useToken(position?.token0?.address);
  const token1 = useToken(position?.token1?.address);

  const { position: positionSDK, pool } = useDerivedPositionInfo(position);

  const liquidityPercentage = new Percent(percent * 25, 100);
  const discountedAmount0 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount0.numerator).numerator
    : undefined;
  const discountedAmount1 = positionSDK
    ? liquidityPercentage.multiply(positionSDK.amount1.numerator).numerator
    : undefined;
  const liquidityValue0 =
    token0 && discountedAmount0
      ? TokenAmount.fromRawAmount(unwrappedToken(token0, chainId) as Token, discountedAmount0)
      : undefined;
  const liquidityValue1 =
    token1 && discountedAmount1
      ? TokenAmount.fromRawAmount(unwrappedToken(token1, chainId) as Token, discountedAmount1)
      : undefined;

  const useConcLiqPositionFees = useConcLiqPositionFeesHook[chainId];
  const [feeValue0, feeValue1] = useConcLiqPositionFees(pool ?? undefined, position?.tokenId);

  const outOfRange =
    pool && position ? pool.tickCurrent < position.tickLower || pool.tickCurrent > position.tickUpper : false;

  const removed = position?.liquidity?.eq(0);

  return {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    removed,
  };
}
