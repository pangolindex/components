import { ChainId, Currency, Price } from '@pangolindex/sdk';
import { USDC, decimalToFraction, wrappedCurrency } from '@pangolindex/shared';
import { useMemo } from 'react';
import { useCoinGeckoCurrencyPrice } from 'src/state';
import { useTokenCurrencyPrice } from '../useCurrencyPrice';

export function useSongBirdUSDPrice(currency?: Currency): Price | undefined {
  const chainId = ChainId.SONGBIRD;

  const wrapped = wrappedCurrency(currency, chainId);
  const tokenPrice = useTokenCurrencyPrice(wrapped); // token price in sgb

  const usd = USDC[chainId];

  const { data: currencyPrice, isLoading } = useCoinGeckoCurrencyPrice(chainId); // sbg price in usd

  return useMemo(() => {
    if (!wrapped || !currencyPrice || !tokenPrice || isLoading || !currency) return undefined;

    const tokenUSDPrice = tokenPrice.raw.multiply(decimalToFraction(currencyPrice));

    return new Price(currency, usd, tokenUSDPrice.denominator, tokenUSDPrice.numerator);
  }, [wrapped, currencyPrice, tokenPrice]);
}
