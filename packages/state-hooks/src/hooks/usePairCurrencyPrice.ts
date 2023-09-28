import { ZERO_ADDRESS, useChainId } from '@honeycomb-finance/shared';
import { JSBI, Pair, Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useTokensCurrencyPriceHook } from './multiChainsHooks';

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
