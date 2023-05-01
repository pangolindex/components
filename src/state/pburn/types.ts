import { Percent, Position, TokenAmount } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';

export interface RemoveElixirLiquidityProps {
  tokenId?: BigNumber;
  liquidityPercentage?: Percent;
  liquidities: {
    liquidityValue0?: TokenAmount;
    liquidityValue1?: TokenAmount;
  };
  feeValues: {
    feeValue0?: TokenAmount;
    feeValue1?: TokenAmount;
  };
  allowedSlippage: Percent;
  deadline?: BigNumber;
  positionSDK?: Position;
}
