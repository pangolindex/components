import { Pair, TokenAmount } from '@pangolindex/sdk';
import { useTotalSupply } from '@pangolindex/state-hooks';

/**
 * this hook is used to fetch total supply of given EVM pair
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function useEvmPairTotalSupply(pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;
  return useTotalSupply(token);
}
