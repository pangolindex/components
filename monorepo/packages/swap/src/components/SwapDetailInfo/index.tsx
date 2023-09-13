import { Text, Tooltip } from '@honeycomb-finance/core';
import {
  BIPS_BASE,
  INITIAL_ALLOWED_SLIPPAGE,
  ONE_BIPS,
  computeSlippageAdjustedAmounts,
  useTranslation,
} from '@honeycomb-finance/shared';
import { useUserSlippageTolerance } from '@honeycomb-finance/state-hooks';
import { ElixirTrade, Fraction, Percent, Trade, TradeType } from '@pangolindex/sdk';
import _uniqueId from 'lodash/uniqueId';
import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { Field } from 'src/state/atom';
import { useDaasFeeInfo } from 'src/state/hooks/common';
import { computeTradePriceBreakdown, warningSeverity } from 'src/utils/prices';
import { ContentBox, DataBox, ValueText } from './styled';

type Props = { trade: Trade | ElixirTrade };

const SwapDetailInfo: React.FC<Props> = ({ trade }) => {
  const [allowedSlippage] = useUserSlippageTolerance();
  const [feeInfo] = useDaasFeeInfo();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
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
    ? `${Number(realizedLPFeeAmount.toSignificant(4)).toFixed(4)} ${trade.inputAmount.currency.symbol}`
    : '-';
  const totalFee = realizedLPFee
    ? `${realizedLPFee.add(new Percent(feeInfo.feeTotal.toString(), BIPS_BASE)).multiply('100').toSignificant(4)}%`
    : '-';

  const renderRow = (label: string, value: string, showSeverity?: boolean, tooltipText?: string) => {
    const id = _uniqueId('swap-tip-detail-');
    return (
      <DataBox key={label}>
        <Text color="swapWidget.secondary" fontSize={14}>
          {label}
        </Text>

        <ValueText
          fontSize={14}
          severity={showSeverity ? warningSeverity(priceImpactWithoutFee) : -1}
          data-tip={!!tooltipText}
          data-for={id}
        >
          {value}
          {tooltipText && (
            <Tooltip id={id} effect="solid" backgroundColor={theme.primary}>
              <Text color="eerieBlack">{tooltipText}</Text>
            </Tooltip>
          )}
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
        : renderRow(
            `${t('swap.liquidityProviderFee')}`,
            lpFeeAmount,
            false,
            realizedLPFeeAmount?.lessThan(new Fraction(1, 10000)) ? realizedLPFeeAmount?.toExact() : undefined,
          )}
    </ContentBox>
  );
};

export default SwapDetailInfo;
