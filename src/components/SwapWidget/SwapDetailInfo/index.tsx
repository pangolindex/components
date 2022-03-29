import { Trade, TradeType } from '@pangolindex/sdk';
import React from 'react';
import { INITIAL_ALLOWED_SLIPPAGE, ONE_BIPS } from 'src/constants';
import { Field } from 'src/state/pswap/actions';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'src/utils/prices';
import { Text } from '../../Text';
import { ContentBox, DataBox, ValueText } from './styled';

type Props = { trade: Trade };

const SwapDetailInfo: React.FC<Props> = ({ trade }) => {
  const [allowedSlippage] = useUserSlippageTolerance();
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade);
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);

  const amount = isExactIn
    ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ?? '-'
    : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? '-';

  const priceImpact = priceImpactWithoutFee
    ? priceImpactWithoutFee.lessThan(ONE_BIPS)
      ? '<0.01%'
      : `${priceImpactWithoutFee.toFixed(2)}%`
    : '-';

  const lpFee = realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-';

  const renderRow = (label: string, value: string, showSeverity?: boolean) => {
    return (
      <DataBox key={label}>
        <Text color="text4" fontSize={14}>
          {label}
        </Text>

        <ValueText fontSize={14} severity={showSeverity ? warningSeverity(priceImpactWithoutFee) : -1}>
          {value}
        </ValueText>
      </DataBox>
    );
  };

  return (
    <ContentBox>
      {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && renderRow('Slippage tolerance', `${allowedSlippage / 100}%`)}
      {renderRow(isExactIn ? 'Minimum Received' : 'Maximum Sold', amount)}
      {renderRow('Price Impact', priceImpact, true)}
      {renderRow('Liquidity Provider Fee', lpFee)}
    </ContentBox>
  );
};

export default SwapDetailInfo;
