import { Box, Button, DoubleCurrencyLogo, Text, Tooltip } from '@honeycomb/core';
import { unwrappedToken, useChainId, useTranslation } from '@honeycomb/shared';
import { useUSDCPriceHook } from '@honeycomb/state-hooks';
import { CurrencyAmount, Fraction } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useMemo } from 'react';
import { useUnderlyingTokensHook } from 'src/hooks';
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
  Row,
} from './styles';
import { PoolCardProps } from './types';

const PoolCard: React.FC<PoolCardProps> = (props) => {
  const { pool, onClick } = props;
  const chainId = useChainId();
  const currency0 = pool?.token0 && unwrappedToken(pool?.token0, chainId);
  const currency1 = pool?.token1 && unwrappedToken(pool?.token1, chainId);

  const { t } = useTranslation();

  const useUnderlyingTokens = useUnderlyingTokensHook[chainId];
  const useUSDCPrice = useUSDCPriceHook[chainId];
  const price0 = useUSDCPrice(pool?.token0 ?? undefined);
  const price1 = useUSDCPrice(pool?.token1 ?? undefined);

  const [underlyingToken0, underlyingToken1] = useUnderlyingTokens(pool?.token0, pool?.token1, pool?.fee);
  const totalFiatValueOfPool: CurrencyAmount | null = useMemo(() => {
    if (!price0 || !price1 || !underlyingToken0 || !underlyingToken1) return null;

    const amount0 = price0.quote(underlyingToken0, chainId);
    const amount1 = price1.quote(underlyingToken1, chainId);
    return amount0.add(amount1);
  }, [price0, price1, underlyingToken0, underlyingToken1]);

  return (
    <>
      <DesktopWrapper>
        <HoverWrapper>
          <Card>
            <Row>
              <Data>
                {currency0 && currency1 && <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />}
                <Text color="color11" fontSize={28} fontWeight={700}>
                  {currency0?.symbol}-{currency1?.symbol}
                </Text>
                <BlackBox>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {Number(pool?.fee) / 10 ** 4}%
                  </BlackBoxContent>
                </BlackBox>
                <BlackBox data-tip data-for={`pool-card`}>
                  <BlackBoxContent color="color11" fontSize={18} fontWeight={500}>
                    {totalFiatValueOfPool?.greaterThan(new Fraction('1', '100'))
                      ? numeral(totalFiatValueOfPool?.toFixed(2)).format('$0.00a')
                      : '-'}
                  </BlackBoxContent>

                  <Tooltip id={`pool-card`} effect="solid">
                    {t('elixir.totalValueLocked')}
                  </Tooltip>
                </BlackBox>
              </Data>

              <Box display={'flex'} flexDirection="column" alignItems={'flex-end'}>
                <Button
                  onClick={() => {
                    onClick(currency0, currency1);
                  }}
                  padding="4px 6px"
                  variant="primary"
                >
                  {t('common.addLiquidity')}
                </Button>
              </Box>
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
                    <Text>{Number(pool?.fee) / 10 ** 4}%</Text>
                  </OptionButton>
                  <BlackBox data-tip data-for={`pool-card`}>
                    <Text p={'2px 6px'} textAlign={'center'} color={'color11'}>
                      {totalFiatValueOfPool?.greaterThan(new Fraction('1', '100'))
                        ? numeral(totalFiatValueOfPool?.toFixed(2)).format('$0.00a')
                        : '-'}
                    </Text>

                    <Tooltip id={`pool-card`} effect="solid">
                      {t('elixir.totalValueLocked')}
                    </Tooltip>
                  </BlackBox>
                </OptionsWrapper>
              </Box>
            </Box>

            {currency0 && currency1 && <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />}
          </Box>

          <Box pt={'15px'}>
            <Button
              height="46px"
              variant="primary"
              borderRadius="4px"
              onClick={() => {
                onClick(currency0, currency1);
              }}
            >
              {t('common.addLiquidity')}
            </Button>
          </Box>
        </Panel>
      </MobileWrapper>
    </>
  );
};

export default PoolCard;
