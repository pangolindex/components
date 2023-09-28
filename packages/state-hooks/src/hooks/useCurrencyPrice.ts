import { PNG, PairState, USDC, decimalToFraction, useChainId, useSubgraphTokens } from '@honeycomb-finance/shared';
import { Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { usePair, usePairsHook } from 'src/hooks/usePair';
import { useShouldUseSubgraph } from 'src/state';

/**
 * Returns the tokens price in relation to gas coin (avax, wagmi, flare, etc)
 *
 * @param tokens array of tokens to get the price in wrapped gas coin
 * @returns object where the key is the address of the token and the value is the Price
 */
export function useTokensCurrencyPriceContract(tokens: (Token | undefined)[]): { [x: string]: Price } {
  const chainId = useChainId();

  const usePairs = usePairsHook[chainId];

  const currency = WAVAX[chainId];
  const usdc = USDC[chainId];
  const png = PNG[chainId];

  // remove currency if exist e remove undefined
  const filteredTokens = useMemo(
    () => tokens.filter((token) => !!token && !token.equals(currency)) as Token[],
    [tokens],
  );

  const _pairs: [Token, Token][] = useMemo(() => filteredTokens.map((token) => [token, currency]), [filteredTokens]);

  const pairs = usePairs(_pairs);

  const [usdcPairsTokens, pngPairsTokens] = useMemo(() => {
    const _usdcPairs: [Token, Token][] = [];
    const _pngPairs: [Token, Token][] = [];
    pairs.forEach(([pairState, pair], index) => {
      const token = filteredTokens[index];
      // if not exist pair or the price is 0 put to array to fetch this token
      if (pairState === PairState.NOT_EXISTS || !pair || !pair.priceOf(token, currency).greaterThan('0')) {
        _usdcPairs.push([token, usdc]);
        _pngPairs.push([token, png]);
      }
    });
    return [_usdcPairs, _pngPairs];
  }, [filteredTokens, pairs]);

  const usdcPairs = usePairs(usdcPairsTokens);
  const pngPairs = usePairs(pngPairsTokens);
  const [pngPairState, usdcPairState] = usePairs([
    [currency, png],
    [currency, usdc],
  ]);

  return useMemo(() => {
    const _prices: { [x: string]: Price } = {};
    // if exist currency, add to object with price 1
    const existCurrency = Boolean(tokens.find((token) => !!token && token.equals(currency)));
    if (existCurrency) {
      _prices[currency.address] = new Price(currency, currency, '1', '1');
    }

    for (let index = 0; index < pairs.length; index++) {
      const [pairState, pair] = pairs[index];
      const token = filteredTokens[index];
      // if not exist pair, return 0 for price of this token
      if (pairState === PairState.LOADING) {
        _prices[token.address] = new Price(token, currency, '1', '0'); // 0
      } else if (pair && pairState === PairState.EXISTS && pair.priceOf(token, currency).greaterThan('0')) {
        const tokenCurrencyPrice = pair.priceOf(token, currency);
        _prices[token.address] = tokenCurrencyPrice;
      } else {
        // if the pair not exist we need to check the token/PNG and token/USDC
        // to check if is posible to get the price
        const tokenUSDCPair = usdcPairs.find(([, _usdcPair]) => _usdcPair?.involvesToken(token));
        const tokenPNGPair = pngPairs.find(([, _pngPair]) => _pngPair?.involvesToken(token));
        if (
          tokenUSDCPair &&
          tokenUSDCPair[0] === PairState.EXISTS &&
          tokenUSDCPair[1] &&
          usdcPairState[0] === PairState.EXISTS &&
          usdcPairState[1]
        ) {
          const _usdcPair = usdcPairState[1];
          const _tokenUSDCPair = tokenUSDCPair[1];
          const usdcWrappedPrice = _usdcPair.priceOf(usdc, currency);
          const tokenUSDCPrice = _tokenUSDCPair.priceOf(token, usdc);
          const finalPrice = tokenUSDCPrice.multiply(usdcWrappedPrice);
          _prices[token.address] = new Price(token, currency, finalPrice.denominator, finalPrice.numerator);
        } else if (
          tokenPNGPair &&
          tokenPNGPair[0] === PairState.EXISTS &&
          tokenPNGPair[1] &&
          pngPairState[0] === PairState.EXISTS &&
          pngPairState[1]
        ) {
          const _pngPair = pngPairState[1];
          const _tokenPNGPair = pngPairState[1];
          const pngWrappedPrice = _pngPair.priceOf(usdc, currency);
          const tokenPNGPrice = _tokenPNGPair.priceOf(token, png);
          const finalPrice = tokenPNGPrice.multiply(pngWrappedPrice);
          _prices[token.address] = new Price(token, currency, finalPrice.denominator, finalPrice.numerator);
        } else {
          _prices[token.address] = new Price(token, currency, '1', '0');
        }
      }
    }

    return _prices;
  }, [pairs, tokens, filteredTokens]);
}

/**
 * this is dummy hook for mapping purpose only
 * Returns the tokens price in relation to gas coin (avax, wagmi, flare, etc)
 *
 * @param tokens array of tokens to get the price in wrapped gas coin
 * @returns object where the key is the address of the token and the value is the Price
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useDummyTokensCurrencyPrice(_tokens: (Token | undefined)[]): { [x: string]: Price } {
  const prices: { [x: string]: Price } = {};

  return prices;
}

/**
 * Returns the token price in relation to gas coin (avax, wagmi, flare, etc)
 *
 * @param token token to get the price
 * @returns the price of token in relation to gas coin
 */
export function useTokenCurrencyPrice(token: Token | undefined): Price {
  const chainId = useChainId();
  const currency = WAVAX[chainId];

  const [pairState, pair] = usePair(token, currency);

  return useMemo(() => {
    if (!token) return new Price(currency, currency, '1', '0');

    if (token.equals(currency)) {
      return new Price(currency, currency, '1', '1');
    }
    if (pairState !== PairState.EXISTS || !pair) {
      return new Price(token, currency, '1', '0'); // 0
    } else {
      return pair.priceOf(token, currency);
    }
  }, [pairState, pair, token]);
}

/**
 * Returns the tokens price in relation to gas coin (hbar)
 * this hook uses subgraph to get the token information based on given token addresses
 *
 * @param tokens array of tokens to get the price in wrapped gas coin
 * @returns object where the key is the address of the token and the value is the Price
 */
export function useTokensCurrencyPriceSubgraph(tokens: (Token | undefined)[]): { [x: string]: Price } {
  const chainId = useChainId();

  const currency = WAVAX[chainId];

  const filteredTokens = useMemo(() => tokens.filter((token) => !!token) as Token[], [tokens]);
  const tokenAddresses = useMemo(() => filteredTokens.map((token) => token?.address), [filteredTokens, chainId]);
  // get tokens from subgraph
  const results = useSubgraphTokens(tokenAddresses);
  const tokenPrices = useMemo(() => {
    return (results?.data || []).reduce((memo, result) => {
      const token = filteredTokens.find((token) => token?.address === result?.id);
      if (token) {
        const fractionPrice = decimalToFraction(Number(result?.derivedETH));
        const denominatorAmount = new TokenAmount(token, fractionPrice?.denominator);
        const numeratorAmount = new TokenAmount(currency, fractionPrice.numerator);
        const price = new Price(token, currency, denominatorAmount.raw, numeratorAmount.raw);
        memo[result?.id] = price;
      }

      return memo;
    }, {} as { [id: string]: Price });
  }, [results?.data, results?.isLoading]);
  return tokenPrices;
}

/**
 * Returns the token price in relation to gas coin (hbar, etc)
 * this subgraph internally uses useTokensCurrencyPriceSubgraph to get price in native token
 *
 * @param token token to get the price
 * @returns the price of token in relation to gas coin
 */
export function useTokenCurrencyPriceSubgraph(token: Token | undefined): Price {
  const chainId = useChainId();
  const currency = WAVAX[chainId];

  const tokenPrice = useTokensCurrencyPriceSubgraph([token]);

  return useMemo(() => {
    if (!token) return new Price(currency, currency, '1', '0');
    return tokenPrice[token?.address];
  }, [tokenPrice, token]);
}

/**
 * its wrapper hook to check which hook need to use based on subgraph on off
 * @param tokens
 * @returns
 */
export function useTokensCurrencyPrice(tokens: (Token | undefined)[]) {
  const shouldUseSubgraph = useShouldUseSubgraph();
  const useHook = shouldUseSubgraph ? useTokensCurrencyPriceSubgraph : useTokensCurrencyPriceContract;
  const res = useHook(tokens);
  return res;
}

/**
 * Returns the tokens price in relation to gas coin hbar
 *
 * @param tokens array of tokens to get the price in wrapped gas coin
 * @returns the price of token in relation to gas coin
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useDummyTokenCurrencyPrice(_token: Token | undefined): Price {
  const chainId = useChainId();
  const currency = WAVAX[chainId];
  return new Price(currency, currency, '1', '0');
}
