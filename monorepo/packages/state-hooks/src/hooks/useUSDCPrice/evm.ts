import { ChainId, Currency, JSBI, Price, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { PairState, USDCe, useChainId, wrappedCurrency } from '@honeycomb/shared';
import { useMemo } from 'react';
import { usePairsContract } from 'src/hooks/usePair/evm';

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
    usePairsContract(tokenPairs);

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
