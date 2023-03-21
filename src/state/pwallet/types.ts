import { BigNumber } from '@ethersproject/bignumber';
import { Currency, CurrencyAmount, Percent, Token, TokenAmount } from '@pangolindex/sdk';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';

export interface AddLiquidityProps {
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
}

export interface RemoveLiquidityProps {
  parsedAmounts: {
    LIQUIDITY_PERCENT: Percent;
    LIQUIDITY?: TokenAmount;
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  deadline: BigNumber | undefined;
  allowedSlippage: number;
  approval: ApprovalState;
}

export interface AttemptToApproveProps {
  parsedAmounts: {
    LIQUIDITY_PERCENT: Percent;
    LIQUIDITY?: TokenAmount;
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  deadline: BigNumber | undefined;
  approveCallback: () => void;
}

export interface CreatePoolProps {
  tokenA?: Token;
  tokenB?: Token;
}
