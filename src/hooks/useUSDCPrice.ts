import { parseUnits } from '@ethersproject/units';
import { ChainId, Currency, JSBI, Price, TokenAmount, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { NEAR_API_BASE_URL } from 'src/constants';
import { USDC, USDCe } from 'src/constants/tokens';
import { decimalToFraction } from 'src/utils';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { PairState, usePairs } from '../data/Reserves';
import { useChainId } from '../hooks';
import { useCoinGeckoCurrencyPrice } from './Tokens';
import { useTokenCurrencyPrice } from './useCurrencyPrice';

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export function useUSDCPrice(currency?: Currency): Price | undefined {
  const chainId = useChainId();
  const wrapped = wrappedCurrency(currency, chainId);
  const USDC = USDCe[chainId];
  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WAVAX[chainId], wrapped) ? undefined : currency,
        chainId ? WAVAX[chainId] : undefined,
      ],
      [wrapped?.equals(USDC) ? undefined : wrapped, chainId === ChainId.AVALANCHE ? USDC : undefined],
      [chainId ? WAVAX[chainId] : undefined, chainId === ChainId.AVALANCHE ? USDC : undefined],
    ],
    [chainId, currency, wrapped, USDC],
  );
  const [[avaxPairState, avaxPair], [usdcPairState, usdcPair], [usdcAvaxPairState, usdcAvaxPair]] =
    usePairs(tokenPairs);

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined;
    }
    // handle wavax/avax
    if (wrapped.equals(WAVAX[chainId])) {
      if (usdcPair) {
        const price = usdcPair.priceOf(WAVAX[chainId], USDC);
        return new Price(currency, USDC, price.denominator, price.numerator);
      } else {
        return undefined;
      }
    }
    // handle usdc
    if (wrapped.equals(USDC)) {
      return new Price(USDC, USDC, '1', '1');
    }

    const avaxPairAVAXAmount = avaxPair?.reserveOfToken(WAVAX[chainId]);
    const avaxPairAVAXUSDCValue: JSBI =
      avaxPairAVAXAmount && usdcAvaxPair
        ? usdcAvaxPair.priceOf(WAVAX[chainId], USDC).quote(avaxPairAVAXAmount, chainId).raw
        : JSBI.BigInt(0);

    // all other tokens
    // first try the usdc pair
    if (
      usdcPairState === PairState.EXISTS &&
      usdcPair &&
      usdcPair.reserveOfToken(USDC).greaterThan(avaxPairAVAXUSDCValue)
    ) {
      const price = usdcPair.priceOf(wrapped, USDC);
      return new Price(currency, USDC, price.denominator, price.numerator);
    }
    if (avaxPairState === PairState.EXISTS && avaxPair && usdcAvaxPairState === PairState.EXISTS && usdcAvaxPair) {
      if (
        usdcAvaxPair.reserveOfToken(USDC).greaterThan('0') &&
        avaxPair.reserveOfToken(WAVAX[chainId]).greaterThan('0')
      ) {
        const avaxUsdcPrice = usdcAvaxPair.priceOf(USDC, WAVAX[chainId]);
        const currencyAvaxPrice = avaxPair.priceOf(WAVAX[chainId], wrapped);
        const usdcPrice = avaxUsdcPrice.multiply(currencyAvaxPrice).invert();
        return new Price(currency, USDC, usdcPrice.denominator, usdcPrice.numerator);
      }
    }
    return undefined;
  }, [
    chainId,
    currency,
    avaxPair,
    avaxPairState,
    usdcAvaxPair,
    usdcAvaxPairState,
    usdcPair,
    usdcPairState,
    wrapped,
    USDC,
  ]);
}

export function useNearUSDCPrice(currency?: Currency): Price | undefined {
  const [result, setResult] = useState<string>('');

  const chainId = useChainId();
  const token = wrappedCurrency(currency, chainId);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const url = `${NEAR_API_BASE_URL}/list-token-price`;
        const response = await fetch(url);
        const data = await response.json();

        if (token) {
          setResult(data?.[token?.address]?.price);
        }
      } catch (error) {
        console.error('near token api error', error);
      }
    };
    fetchPrice();
  }, [token]);

  const USDC = USDCe[chainId];

  return useMemo(() => {
    if (!currency || !token || !chainId || !result) {
      return undefined;
    }

    const tokenAmount1 = new TokenAmount(token, parseUnits(result || '1', token?.decimals).toString());
    const tokenAmount2 = new TokenAmount(USDC, parseUnits('1', USDC?.decimals).toString());

    return new Price(USDC, currency, tokenAmount2.raw, tokenAmount1.raw);
  }, [chainId, currency, token, USDC, result]);
}

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
