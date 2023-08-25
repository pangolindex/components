import { AutoColumn, ColumnCenter, Loader, Text } from '@pangolindex/core';
import { useChainId, wrappedCurrency } from '@pangolindex/shared';
import { format } from 'd3';
import { saturate } from 'polished';
import React, { ReactNode, useCallback, useContext, useMemo } from 'react';
import { BarChart2, CloudOff, Inbox } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { batch } from 'react-redux';
import { ThemeContext } from 'styled-components';
import { useDensityChartData } from 'src/hooks/chart/evm';
import { Chart } from './Chart';
import { ChartWrapper } from './styles';
import { Bound, FeeAmount, LiquidityChartRangeInputProps, ZOOM_LEVELS } from './types';

function InfoBox({ message, icon }: { message?: ReactNode; icon: ReactNode }) {
  return (
    <ColumnCenter style={{ height: '100%', justifyContent: 'center' }}>
      {icon}
      {message && (
        <Text padding={10} marginTop="20px" textAlign="center">
          {message}
        </Text>
      )}
    </ColumnCenter>
  );
}

const LiquidityChartRangeInput: React.FC<LiquidityChartRangeInputProps> = (props) => {
  const {
    currency0,
    currency1,
    feeAmount,
    ticksAtLimit,
    price,
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    interactive,
  } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const chainId = useChainId();
  const tokenA = wrappedCurrency(currency0, chainId);
  const tokenB = wrappedCurrency(currency1, chainId);

  const isSorted = tokenA && tokenB && !tokenA.equals(tokenB) && tokenA?.sortsBefore(tokenB);

  const { isLoading, error, formattedData } = useDensityChartData({
    currencyA: currency0,
    currencyB: currency1,
    feeAmount,
  });

  const onBrushDomainChangeEnded = useCallback(
    (domain: [number, number], mode: string | undefined) => {
      let leftRangeValue = Number(domain[0]);
      const rightRangeValue = Number(domain[1]);

      if (leftRangeValue <= 0) {
        leftRangeValue = 1 / 10 ** 6;
      }

      batch(() => {
        // simulate user input for auto-formatting and other validations
        if (
          (!ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || mode === 'handle' || mode === 'reset') &&
          leftRangeValue > 0
        ) {
          onLeftRangeInput(leftRangeValue.toFixed(6));
        }

        if ((!ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || mode === 'reset') && rightRangeValue > 0) {
          // todo: remove this check. Upper bound for large numbers
          // sometimes fails to parse to tick.
          if (rightRangeValue < 1e35) {
            onRightRangeInput(rightRangeValue.toFixed(6));
          }
        }
      });
    },
    [isSorted, onLeftRangeInput, onRightRangeInput, ticksAtLimit],
  );

  const interactiveStatus = interactive && Boolean(formattedData?.length);

  // const brushDomain: [number, number] | undefined = useMemo(() => {

  //   return leftPrice && rightPrice ? [leftPrice, rightPrice] : undefined;
  // }, [isSorted, priceLower, priceUpper]);

  const brushDomain: [number, number] | undefined = useMemo(() => {
    const leftPrice = isSorted ? priceLower : priceUpper?.invert();
    const rightPrice = isSorted ? priceUpper : priceLower?.invert();

    return leftPrice && rightPrice
      ? [parseFloat(leftPrice?.toSignificant(6)), parseFloat(rightPrice?.toSignificant(6))]
      : undefined;
  }, [isSorted, priceLower, priceUpper]);

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      if (!price) return '';

      if (d === 'w' && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0';
      if (d === 'e' && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞';

      const percent = (x < price ? -1 : 1) * ((Math.max(x, price) - Math.min(x, price)) / price) * 100;

      return price ? `${format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent)}%` : '';
    },
    [isSorted, price, ticksAtLimit],
  );

  const isUninitialized = !currency0 || !currency1 || (formattedData === undefined && !isLoading);
  return (
    <AutoColumn gap="md" style={{ minHeight: '200px' }}>
      {isUninitialized ? (
        <InfoBox
          message={<div>{t('liquidityChartRangeInput.uninitialized')}</div>}
          icon={<Inbox size={56} stroke={theme.primary} />}
        />
      ) : isLoading ? (
        <InfoBox icon={<Loader size={40} />} />
      ) : error ? (
        <InfoBox
          message={<div>{t('liquidityChartRangeInput.error')}</div>}
          icon={<CloudOff size={56} stroke={theme.text1} />}
        />
      ) : !formattedData || formattedData.length === 0 || !price ? (
        <InfoBox
          message={<div>{t('liquidityChartRangeInput.noData')}</div>}
          icon={<BarChart2 size={56} stroke={theme.text1} />}
        />
      ) : (
        <ChartWrapper>
          <Chart
            data={{ series: formattedData, current: price }}
            dimensions={{ width: 400, height: 200 }}
            margins={{ top: 10, right: 2, bottom: 20, left: 0 }}
            styles={{
              area: {
                selection: theme.green1,
              },
              brush: {
                handle: {
                  west: saturate(0.1, theme.green1),
                  east: saturate(0.1, theme.green1),
                },
              },
            }}
            interactive={interactiveStatus}
            brushLabels={brushLabelValue}
            brushDomain={brushDomain}
            onBrushDomainChange={onBrushDomainChangeEnded}
            zoomLevels={ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM]}
            ticksAtLimit={ticksAtLimit}
          />
        </ChartWrapper>
      )}
    </AutoColumn>
  );
};

export default LiquidityChartRangeInput;
