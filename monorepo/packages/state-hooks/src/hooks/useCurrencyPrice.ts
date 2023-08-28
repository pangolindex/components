import { JSBI, Pair, Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import {
  PNG,
  PairState,
  USDC,
  ZERO_ADDRESS,
  decimalToFraction,
  useChainId,
  useSubgraphTokens,
} from '@pangolindex/shared';
import { useMemo } from 'react';
import { usePair, usePairsHook } from 'src/hooks/usePair';
import { useShouldUseSubgraph } from 'src/state';
import { useTokensCurrencyPriceHook } from './multiChainsHooks';

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

/**
 * Returns the price of pairs in relation to gas coin
 *
 * @param pairs array of pair and total supply of pair
 * @returns object where the key is the address of the pair and the value is the Price
 */
export function usePairsCurrencyPrice(pairs: { pair: Pair; totalSupply: TokenAmount }[]) {
  const chainId = useChainId();

  const useTokensCurrencyPrice = useTokensCurrencyPriceHook[chainId];
  const currency = WAVAX[chainId];

  const uniqueTokens = useMemo(() => {
    // Have the same size
    const tokens0 = pairs.map(({ pair }) => pair.token0);
    const tokens1 = pairs.map(({ pair }) => pair.token1);

    const _uniqueTokens: Token[] = [];
    const map = new Map();
    for (let index = 0; index < tokens0.length; index++) {
      const token0 = tokens0[index];
      const token1 = tokens1[index];
      if (!map.has(token0.address)) {
        map.set(token0.address, true);
        _uniqueTokens.push(token0);
      }
      if (!map.has(token1.address)) {
        map.set(token1.address, true);
        _uniqueTokens.push(token1);
      }
    }

    return _uniqueTokens;
  }, [pairs]);

  const tokensPrices = useTokensCurrencyPrice(uniqueTokens);

  return useMemo(() => {
    const pairsPrices: { [key: string]: Price | undefined } = {};
    for (let index = 0; index < pairs.length; index++) {
      const { pair, totalSupply } = pairs[index];
      const token0 = pair.token0;
      const token1 = pair.token1;

      const token0Price = tokensPrices[token0.address] ?? new Price(token0, currency, '1', '0');
      const token1Price = tokensPrices[token1.address] ?? new Price(token1, currency, '1', '0');

      const token0Amount = pair.reserve0;
      const token1Amount = pair.reserve1;

      const token0PairPrice = token0Amount
        .multiply(token0Price)
        .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals - token0.decimals)));
      const token1PairPrice = token1Amount
        .multiply(token1Price)
        .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals - token1.decimals)));

      const _pairPrice = token0PairPrice.add(token1PairPrice).divide(totalSupply);
      const pairPrice = new Price(pair.liquidityToken, currency, _pairPrice.denominator, _pairPrice.numerator);
      pairsPrices[pair.liquidityToken.address] = pairPrice;
    }
    return pairsPrices;
  }, [pairs, tokensPrices]);
}

/**
 * Returns the price of pair in relation to gas coin
 *
 * @param pair the pair and the total supply of pair
 * @returns the price of pair in relation to gas coin
 */
export function usePairCurrencyPrice(pair: { pair: Pair | null; totalSupply: TokenAmount | undefined }): Price {
  const chainId = useChainId();

  const useTokensCurrencyPrice = useTokensCurrencyPriceHook[chainId];

  const currency = WAVAX[chainId];

  const _pair = pair.pair;
  const totalSupply = pair.totalSupply;
  const token0 = _pair?.token0;
  const token1 = _pair?.token1;
  const tokensPrices = useTokensCurrencyPrice([token0, token1]);

  return useMemo(() => {
    if (!token0 || !token1 || !_pair || !totalSupply)
      return new Price(new Token(chainId, ZERO_ADDRESS, 18), currency, '1', '0');

    const token0Price = tokensPrices[token0.address] ?? new Price(token0, currency, '1', '0');
    const token1Price = tokensPrices[token1.address] ?? new Price(token1, currency, '1', '0');

    const token0Amount = _pair.reserve0;
    const token1Amount = _pair.reserve1;

    const token0PairPrice = token0Amount
      .multiply(token0Price)
      .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals - token0.decimals)));
    const token1PairPrice = token1Amount
      .multiply(token1Price)
      .divide(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals - token1.decimals)));

    const _pairPrice = token0PairPrice.add(token1PairPrice).divide(totalSupply);

    return new Price(_pair.liquidityToken, currency, _pairPrice.denominator, _pairPrice.numerator);
  }, [token0, token1, tokensPrices, _pair, totalSupply]);
}
