import { JSBI, Pair, Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useSubgraphTokens } from 'src/apollo/tokens';
import { ZERO_ADDRESS } from 'src/constants';
import { PairState, usePair } from 'src/data/Reserves';
import { usePairsHook } from 'src/data/multiChainsHooks';
import { decimalToFraction } from 'src/utils';
import { hederaFn } from 'src/utils/hedera';
import { useTokensCurrencyPriceHook } from './multiChainsHooks';
import { useChainId } from '.';

/**
 * Returns the tokens price in relation to gas coin (avax, wagmi, flare, etc)
 *
 * @param tokens array of tokens to get the price in wrapped gas coin
 * @returns object where the key is the address of the token and the value is the Price
 */
export function useTokensCurrencyPrice(tokens: (Token | undefined)[]): { [x: string]: Price } {
  const chainId = useChainId();

  const usePairs = usePairsHook[chainId];

  const currency = WAVAX[chainId];

  // remove currency if exist e remove undefined
  const filteredTokens = tokens.filter((token) => !!token && !token.equals(currency)) as Token[];

  const _pairs: [Token, Token][] = filteredTokens.map((token) => [token, currency]);

  const pairs = usePairs(_pairs);

  const prices: { [x: string]: Price } = {};

  // if exist currency, add to object with price 1
  const existCurrency = Boolean(tokens.find((token) => !!token && token.equals(currency)));
  if (existCurrency) {
    prices[currency.address] = new Price(currency, currency, '1', '1');
  }

  return useMemo(() => {
    pairs.forEach(([pairState, pair], index) => {
      const token = filteredTokens[index];
      // if not exist pair, return 0 for price of this token
      if (pairState !== PairState.EXISTS || !pair) {
        prices[token.address] = new Price(token, currency, '1', '0'); // 0
      } else {
        const tokenCurrencyPrice = pair.priceOf(token, currency);
        prices[token.address] = tokenCurrencyPrice;
      }
    });
    return prices;
  }, [pairs, prices, filteredTokens]);
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
  const tokenAddresses = useMemo(
    () => filteredTokens.map((token) => token?.address?.toLowerCase()),
    [filteredTokens, chainId],
  );
  // get tokens from subgraph
  const results = useSubgraphTokens(tokenAddresses);
  const tokenPrices = useMemo(() => {
    return (results?.data || []).reduce((memo, result) => {
      const token = filteredTokens.find((token) => token?.address?.toLowerCase() === result?.id);
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

    return tokenPrice[token?.address?.toLowerCase()];
  }, [tokenPrice, token]);
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

  // Have the same size
  const tokens0 = pairs.map(({ pair }) => pair.token0);
  const tokens1 = pairs.map(({ pair }) => pair.token1);

  const uniqueTokens: Token[] = [];
  const map = new Map();
  for (let index = 0; index < tokens0.length; index++) {
    const token0 = tokens0[index];
    const token1 = tokens1[index];
    if (!map.has(token0.address)) {
      map.set(token0.address, true);
      uniqueTokens.push(token0);
    }
    if (!map.has(token1.address)) {
      map.set(token1.address, true);
      uniqueTokens.push(token1);
    }
  }

  const tokensPrices = useTokensCurrencyPrice(uniqueTokens);

  return useMemo(() => {
    const pairsPrices: { [key: string]: Price } = {};
    for (let index = 0; index < pairs.length; index++) {
      const { pair, totalSupply } = pairs[index];
      const token0 = pair.token0;
      const token1 = pair.token1;
      // TODO: this is really for short term, ugly code
      // make sure to fix it asap
      // here specifically for hedera we are checking 1 PGL price little different
      // this is mainly due to hedera PGL has 0 decimals and its creating weird edge cases
      if (hederaFn.isHederaChain(chainId)) {
        const token0Price = tokensPrices[token0.address?.toLowerCase()] ?? new Price(token0, currency, '1', '0');
        const token1Price = tokensPrices[token1.address?.toLowerCase()] ?? new Price(token1, currency, '1', '0');
        const reserve0 = pair?.reserve0;
        const reserve1 = pair?.reserve1;
        // reserve0 * token0PriceInEth + reserve1 * token1PriceInEth => tvlInEth
        const tvlInEth = reserve0.multiply(token0Price).add(reserve1.multiply(token1Price));
        // tvlInEth / totalSupply => 1 PGL price in ETH
        const pairPriceFraction = tvlInEth.divide(totalSupply.raw);
        const pairPrice = new Price(currency, currency, pairPriceFraction.denominator, pairPriceFraction.numerator);
        pairsPrices[pair.liquidityToken.address] = pairPrice;
        continue;
      }

      // for all other chains except hedera
      // continue with below logic
      const token0Price = tokensPrices[token0.address] ?? new Price(token0, currency, '1', '0');
      const token1Price = tokensPrices[token1.address] ?? new Price(token1, currency, '1', '0');

      //here we need to do for totalSupply token decimal bcoz chain wise need to get ONE_Token
      const ONE_TOKEN = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(totalSupply?.token?.decimals));

      let token0Amount: TokenAmount = new TokenAmount(token0, '0');
      let token1Amount: TokenAmount = new TokenAmount(token1, '0');
      if (JSBI.greaterThan(totalSupply.raw, ONE_TOKEN) || JSBI.equal(totalSupply.raw, ONE_TOKEN)) {
        [token0Amount, token1Amount] = pair.getLiquidityValues(
          totalSupply,
          new TokenAmount(pair.liquidityToken, ONE_TOKEN),
        );
      }
      const token0PairPrice = token0Amount.multiply(token0Price);
      const token1PairPrice = token1Amount.multiply(token1Price);
      const _pairPrice = token0PairPrice.add(token1PairPrice);
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

    let token0Amount: TokenAmount = new TokenAmount(token0, '0');
    let token1Amount: TokenAmount = new TokenAmount(token1, '0');
    const ONE_TOKEN = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(totalSupply?.token?.decimals));
    if (JSBI.greaterThan(totalSupply.raw, ONE_TOKEN) || JSBI.equal(totalSupply?.raw, ONE_TOKEN)) {
      [token0Amount, token1Amount] = _pair.getLiquidityValues(
        totalSupply,
        new TokenAmount(_pair.liquidityToken, ONE_TOKEN),
      );
    }

    const token0PairPrice = token0Amount.multiply(token0Price);
    const token1PairPrice = token1Amount.multiply(token1Price);

    const _pairPrice = token0PairPrice.add(token1PairPrice);
    return new Price(_pair.liquidityToken, currency, _pairPrice.denominator, _pairPrice.numerator);
  }, [token0, token1, tokensPrices, _pair, totalSupply]);
}
