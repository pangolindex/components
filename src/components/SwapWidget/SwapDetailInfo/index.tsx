import { Percent, Trade, TradeType } from '@pangolindex/sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { INITIAL_ALLOWED_SLIPPAGE, ONE_BIPS } from 'src/constants';
import { BIPS_BASE } from 'src/constants/swap';
import { Field } from 'src/state/pswap/atom';
import { useDaasFeeInfo } from 'src/state/pswap/hooks/common';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'src/utils/prices';
import { Text } from '../../Text';
import { ContentBox, DataBox, ValueText } from './styled';

type Props = { trade: Trade };

const SwapDetailInfo: React.FC<Props> = ({ trade }) => {
  const [allowedSlippage] = useUserSlippageTolerance();
  const [feeInfo] = useDaasFeeInfo();
  const { t } = useTranslation();
  const { priceImpactWithoutFee, realizedLPFee, realizedLPFeeAmount } = computeTradePriceBreakdown(trade);
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

  const lpFeeAmount = realizedLPFeeAmount
    ? `${realizedLPFeeAmount.toSignificant(4)} ${trade.inputAmount.currency.symbol}`
    : '-';
  const totalFee = realizedLPFee
    ? `${realizedLPFee.add(new Percent(feeInfo.feeTotal.toString(), BIPS_BASE)).multiply('100').toSignificant(4)}%`
    : '-';

  const renderRow = (label: string, value: string, showSeverity?: boolean) => {
    return (
      <DataBox key={label}>
        <Text color="swapWidget.secondary" fontSize={14}>
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
      {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE &&
        renderRow(`${t('swapPage.slippageTolerance')}`, `${allowedSlippage / 100}%`)}
      {renderRow(isExactIn ? `${t('swap.minimumReceived')}` : `${t('swap.maximumSold')}`, amount)}
      {renderRow(`${t('swap.priceImpact')}`, priceImpact, true)}
      {feeInfo?.feeTotal > 0
        ? renderRow(`${t('swap.totalFee')}`, totalFee)
        : renderRow(`${t('swap.liquidityProviderFee')}`, lpFeeAmount)}
    </ContentBox>
  );
};

export default SwapDetailInfo;
