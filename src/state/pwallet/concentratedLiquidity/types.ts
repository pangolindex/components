import { Currency, CurrencyAmount, FeeAmount, Position } from '@pangolindex/sdk';
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

export interface ConcAddLiquidityProps {
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  deadline: BigNumber | undefined;
  noLiquidity: boolean | undefined;
  allowedSlippage: number;
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
  position?: Position;
}
