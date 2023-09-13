import { useTotalSupply } from '@honeycomb-finance/state-hooks';
import { Pair, TokenAmount } from '@pangolindex/sdk';

/**
 * this hook is used to fetch total supply of given EVM pair
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function useEvmPairTotalSupply(pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;
  return useTotalSupply(token);
}
