import { TokenReturnType } from '@honeycomb-finance/state-hooks';
import { Currency, CurrencyAmount, FeeAmount, Position, Token, TokenAmount } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';

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

export interface UseElixirPositionResults {
  loading: boolean;
  position: PositionDetailsFromChain | undefined;
}

export interface UseElixirPositionsResults {
  loading: boolean;
  positions: PositionDetailsFromChain[] | undefined;
}

export interface ElixirAddLiquidityProps {
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  tokenId?: BigNumber;
  hasExistingPosition?: boolean;
  deadline: BigNumber | undefined;
  noLiquidity: boolean | undefined;
  allowedSlippage: number;
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
  position?: Position;
}

export interface ElixirLiquidityCollectFeesProps {
  tokenId?: BigNumber;
  tokens: {
    token0?: Token;
    token1?: Token;
  };
  feeValues: {
    feeValue0?: TokenAmount;
    feeValue1?: TokenAmount;
  };
}
