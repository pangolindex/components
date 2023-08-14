import { parseUnits } from '@ethersproject/units';
import { Currency, Price } from '@pangolindex/sdk';
import { USDC, decimalToFraction, useChainId, wrappedCurrency } from '@pangolindex/shared';
import { useMemo } from 'react';
import { useCoinGeckoCurrencyPrice } from 'src/state';
import { useTokenCurrencyPriceHook } from '../multiChainsHooks';

/**
 * this hook which is used to fetch token price in usd
 * first we get given token price in native token i.e. hbar/flare/sgb
 * then we get hbar/flare/sgb price in usd using coingecko
 * denominatorAmount in baseCurrency
 * numeratorAmount in quoteCurrency
 * finally we get token price in usd
 * @param currency
 * @returns
 */
export function useUsdPriceCoingecko(currency?: Currency): Price | undefined {
  const chainId = useChainId();

  const useTokenCurrencyPrice = useTokenCurrencyPriceHook[chainId];

  const wrapped = wrappedCurrency(currency, chainId);

  const tokenPrice = useTokenCurrencyPrice(wrapped); // token price in hbar

  const usd = USDC[chainId];

  const { data: currencyPrice, isLoading } = useCoinGeckoCurrencyPrice(chainId); // hbar price in usd

  return useMemo(() => {
    if (!wrapped || !currencyPrice || !tokenPrice || isLoading || !currency) return undefined;

    const tokenUSDPrice = tokenPrice.raw.multiply(decimalToFraction(currencyPrice));

    // we need to consider denominator & numerator values in terms of their
    // base & quote currency decimals
    const denominator = parseUnits(tokenUSDPrice.denominator.toString(), wrapped.decimals).toString();
    const numerator = parseUnits(tokenUSDPrice.numerator.toString(), usd.decimals).toString();
    return new Price(wrapped, usd, denominator, numerator);
  }, [wrapped, currencyPrice, tokenPrice]);
}
