import { Position } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, DoubleCurrencyLogo, Text } from 'src/components';
import { Bound } from 'src/components/LiquidityChartRangeInput/types';
import { useChainId } from 'src/hooks';
import useIsTickAtLimit, {
  getPriceOrderingFromPositionForUI,
  usePool,
} from 'src/hooks/concentratedLiquidity/hooks/common';
import { formatTickPrice } from 'src/utils';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import {
  BlackBox,
  BlackBoxContent,
  Card,
  Data,
  DesktopWrapper,
  HoverWrapper,
  MobileWrapper,
  OptionButton,
  OptionsWrapper,
  Panel,
  PriceWrapper,
  Row,
} from './styles';
import { PositionCardProps } from './types';

const PositionCard: React.FC<PositionCardProps> = (props) => {
  const { token0, token1, feeAmount, liquidity, onClick, tickLower, tickUpper } = props;
  const chainId = useChainId();
  const currency0 = token0 && unwrappedToken(token0, chainId);
  const currency1 = token1 && unwrappedToken(token1, chainId);
  // construct Position from details returned
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount);
  const position = useMemo(() => {
    if (pool) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper });
    }
    return undefined;
  }, [liquidity, pool, tickLower, tickUpper]);
  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper);
  const { priceLower, priceUpper } = getPriceOrderingFromPositionForUI(position);
  // check if price is within range
  const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false;
  const closed: boolean = liquidity.isZero();
  const minPrice = formatTickPrice({
    price: priceLower,
    atLimit: tickAtLimit,
    direction: Bound.LOWER,
  });
  const maxPrice = formatTickPrice({
    price: priceUpper,
    atLimit: tickAtLimit,
    direction: Bound.UPPER,
  });
  const { t } = useTranslation();

  return (
    <>
      <DesktopWrapper>
        <HoverWrapper>
          <Card onClick={onClick}>
            <Row>
              <Data>
                {currency0 && currency1 && <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />}
                <Text color="color11" fontSize={28} fontWeight={700}>
                  {currency0?.symbol}-{currency1?.symbol}
                </Text>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    %{feeAmount / 10 ** 4}
                  </BlackBoxContent>
                </BlackBox>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {!liquidity?.isZero() ? t('common.open') : t('common.closed')}
                  </BlackBoxContent>
                </BlackBox>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {closed
                      ? t('common.closed')
                      : outOfRange
                      ? t('concentratedLiquidity.positionCard.outOfRange')
                      : t('concentratedLiquidity.positionCard.inRange')}
                  </BlackBoxContent>
                </BlackBox>
              </Data>
              <PriceWrapper>
                <Box display={'flex'} flexDirection="column" alignItems={'flex-end'}>
                  <Box display={'flex'}>
                    <Text color="primary" fontSize={18} fontWeight={500}>
                      {t('common.min')}:&nbsp;
                    </Text>
                    <Text color="color11" fontSize={18} fontWeight={500}>
                      {minPrice} {currency0?.symbol} per {currency1?.symbol}
                    </Text>
                  </Box>
                  <Box display={'flex'}>
                    <Text color="primary" fontSize={18} fontWeight={500}>
                      {t('common.max')}:&nbsp;
                    </Text>
                    <Text color="color11" fontSize={18} fontWeight={500}>
                      {maxPrice} {currency0?.symbol} per {currency1?.symbol}
                    </Text>
                  </Box>
                </Box>
              </PriceWrapper>
            </Row>
          </Card>
        </HoverWrapper>
      </DesktopWrapper>
      <MobileWrapper>
        <Panel>
          <Box display="flex" alignItems="center" justifyContent="space-between" pb={'20px'}>
            <Box>
              <Text fontSize={24} fontWeight={500} color={'color11'}>
                {currency0?.symbol}-{currency1?.symbol}
              </Text>

              <Box pt={'10px'} display={'flex'} flexDirection={'row'}>
                <OptionsWrapper>
                  <OptionButton>
                    <Text>%{feeAmount / 10 ** 4}</Text>
                  </OptionButton>
                  <BlackBox>
                    <Text p={'2px 6px'} textAlign={'center'} color={'color11'}>
                      {t('common.open')}
                    </Text>
                  </BlackBox>
                </OptionsWrapper>
              </Box>
            </Box>

            {currency0 && currency1 && <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />}
          </Box>

          <PriceWrapper>
            <Box display={'flex'} flexDirection="column">
              <Text color="primary" fontSize={18} fontWeight={500}>
                {t('common.min')}:&nbsp;
              </Text>
              <Text color="color11" fontSize={18} fontWeight={500}>
                {minPrice} {currency0?.symbol}/{currency1?.symbol}
              </Text>
            </Box>
            <Box display={'flex'} flexDirection="column">
              <Text color="primary" fontSize={18} fontWeight={500}>
                {t('common.max')}:&nbsp;
              </Text>
              <Text color="color11" fontSize={18} fontWeight={500}>
                {maxPrice} {currency0?.symbol}/{currency1?.symbol}
              </Text>
            </Box>
          </PriceWrapper>
          <Box pt={'15px'}>
            <Button height="46px" variant="primary" borderRadius="4px" onClick={onClick}>
              {t('concentratedLiquidity.positionCard.seeDetails')}
            </Button>
          </Box>
        </Panel>
      </MobileWrapper>
    </>
  );
};

export default PositionCard;
