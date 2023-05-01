import { CurrencyAmount, Fraction, NumberType, Position, formatPrice } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useContext, useMemo } from 'react';
import ContentLoader from 'react-content-loader';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Stat, Text } from 'src/components';
import { useChainId } from 'src/hooks';
import { usePositionTokenURIHook, useUnderlyingTokensHook } from 'src/hooks/elixir/hooks';
import useIsTickAtLimit, { getPriceOrderingFromPositionForUI, usePool } from 'src/hooks/elixir/hooks/common';
import { useUSDCPriceHook } from 'src/hooks/useUSDCPrice';
import { Bound } from 'src/state/pmint/elixir/atom';
import { formatTickPrice, useInverter } from 'src/utils';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import PriceCard from './PriceCard';
import { Information, NFT, PriceCards, PriceDetailAndNft, StateContainer, Wrapper } from './styles';
import { DetailTabProps } from './types';

const DetailTab: React.FC<DetailTabProps> = (props) => {
  const { position } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const chainId = useChainId();

  const currency0 = position?.token0 ? unwrappedToken(position?.token0, chainId) : undefined;
  const currency1 = position?.token1 ? unwrappedToken(position?.token1, chainId) : undefined;

  const useUnderlyingTokens = useUnderlyingTokensHook[chainId];
  const usePositionTokenURI = usePositionTokenURIHook[chainId];
  const metadata = usePositionTokenURI(position?.tokenId);
  const [, pool] = usePool(position?.token0 ?? undefined, position?.token1 ?? undefined, position?.fee);
  const nativePosition = useMemo(() => {
    if (
      pool &&
      position?.liquidity &&
      typeof position?.tickLower === 'number' &&
      typeof position?.tickUpper === 'number'
    ) {
      return new Position({
        pool,
        liquidity: position?.liquidity.toString(),
        tickLower: position?.tickLower,
        tickUpper: position?.tickUpper,
      });
    }
    return undefined;
  }, [position?.liquidity, pool, position?.tickLower, position?.tickUpper]);

  const tickAtLimit = useIsTickAtLimit(position?.fee, position?.tickLower, position?.tickUpper);
  const pricesFromPosition = getPriceOrderingFromPositionForUI(nativePosition);
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: false, // we don't want to invert the price, just the tokens
  });
  const inverted = position?.token1 ? base?.equals(position?.token1) : undefined;
  const currentPrice = pool && formatPrice(inverted ? pool?.token1Price : pool?.token0Price, NumberType.TokenTx);
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

  const useUSDCPrice = useUSDCPriceHook[chainId];
  const price0 = useUSDCPrice(position?.token0 ?? undefined);
  const price1 = useUSDCPrice(position?.token1 ?? undefined);
  const fiatValueOfLiquidity: CurrencyAmount | null = useMemo(() => {
    if (!price0 || !price1 || !nativePosition) return null;
    const amount0 = price0.quote(nativePosition?.amount0, chainId);
    const amount1 = price1.quote(nativePosition?.amount1, chainId);
    return amount0.add(amount1);
  }, [price0, price1, nativePosition]);
  const [underlyingToken0, underlyingToken1] = useUnderlyingTokens(position?.token0, position?.token1, position?.fee);
  const totalFiatValueOfPool: CurrencyAmount | null = useMemo(() => {
    if (!price0 || !price1 || !underlyingToken0 || !underlyingToken1) return null;

    const amount0 = price0.quote(underlyingToken0, chainId);
    const amount1 = price1.quote(underlyingToken1, chainId);
    return amount0.add(amount1);
  }, [price0, price1, underlyingToken0, underlyingToken1]);

  const currencyPair = position ? `${currency0?.symbol}/${currency1?.symbol}` : '';

  const totalData = [
    {
      title: 'Total Stake',
      stat: totalFiatValueOfPool?.greaterThan(new Fraction('1', '100'))
        ? numeral(totalFiatValueOfPool?.toFixed(2)).format('$0.00a')
        : '-',
    },
    {
      title: `Underlying  ${currency0?.symbol}`,
      stat: underlyingToken0 ? numeral(underlyingToken0?.toFixed(6)).format('0.00a') : '-',
      currency: currency0,
    },
    {
      title: `Underlying ${currency1?.symbol}`,
      stat: underlyingToken1 ? numeral(underlyingToken1?.toFixed(6)).format('0.00a') : '-',
      currency: currency1,
    },
  ];

  const userData = [
    {
      title: 'Your Stake',
      stat: fiatValueOfLiquidity?.greaterThan(new Fraction('1', '100'))
        ? numeral(fiatValueOfLiquidity?.toFixed(2)).format('$0.00a')
        : '-',
    },
    {
      title: `Underlying ${currency0?.symbol}`,
      stat: nativePosition?.amount0 ? numeral(nativePosition?.amount0?.toFixed(6)).format('0.00a') : '-',
      currency: currency0,
    },
    {
      title: `Underlying ${currency1?.symbol}`,
      stat: nativePosition?.amount1 ? numeral(nativePosition?.amount1?.toFixed(6)).format('0.00a') : '-',
      currency: currency1,
    },
  ];

  return (
    <Wrapper>
      <PriceDetailAndNft>
        <Box display={'flex'}>
          {metadata?.result?.image ? (
            <NFT src={metadata?.result?.image || ''} alt={'Position'} />
          ) : (
            <ContentLoader
              speed={3}
              width={'100%'}
              height={'100%'}
              viewBox="0 0 210 362"
              backgroundColor={theme?.elixir?.primaryBgColor}
              foregroundColor={theme?.primary}
              {...props}
            >
              <rect x="1" y="1" rx="8" ry="8" width="185" height="22" />
              <rect x="1" y="38" rx="8" ry="8" width="185" height="22" />
              <rect x="1" y="322" rx="8" ry="8" width="87" height="11" />
              <rect x="1" y="343" rx="8" ry="8" width="87" height="11" />
              <rect x="168" y="320" rx="4" ry="4" width="16" height="15" />
              <rect x="168" y="340" rx="4" ry="4" width="16" height="15" />
              <rect x="2" y="94" rx="8" ry="8" width="184" height="181" />
              <rect x="0" y="301" rx="8" ry="8" width="87" height="11" />
            </ContentLoader>
          )}
        </Box>
        <Box display={'flex'} flexDirection={'column'}>
          <PriceCards>
            <PriceCard
              title={'Min Price'}
              price={minPrice}
              currencyPair={currencyPair}
              description={`Your position will be 100% ${currency1?.symbol} at this price.`}
            />
            <PriceCard
              title={'Max Price'}
              price={maxPrice}
              currencyPair={currencyPair}
              description={`Your position will be 100% ${currency0?.symbol} at this price.`}
            />
          </PriceCards>
          <Box>
            <PriceCard title={'Current Price'} price={currentPrice || ''} currencyPair={currencyPair} />
          </Box>
        </Box>
      </PriceDetailAndNft>
      <Information>
        <Text fontSize={24} fontWeight={500} color={'text2'} mb={'20px'}>
          {t('common.totalStake')}
        </Text>
        <StateContainer colNumber={totalData.length}>
          {totalData.map((item, index) => (
            <Stat
              key={index}
              title={item.title}
              stat={item.stat}
              titlePosition="top"
              titleFontSize={14}
              titleColor="text8"
              {...(item.currency && { currency: item.currency })}
              statFontSize={[24, 18]}
            />
          ))}
        </StateContainer>
      </Information>
      <Information>
        <Text fontSize={24} fontWeight={500} color={'text2'} mb={'20px'}>
          {t('common.yourStake')}
        </Text>
        <StateContainer colNumber={userData.length}>
          {userData.map((item, index) => (
            <Stat
              key={index}
              title={item.title}
              stat={item.stat}
              titlePosition="top"
              titleFontSize={14}
              titleColor="text8"
              {...(item.currency && { currency: item.currency })}
              statFontSize={[24, 18]}
            />
          ))}
        </StateContainer>
      </Information>
    </Wrapper>
  );
};

export default DetailTab;
