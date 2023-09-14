import { useChainId } from '@honeycomb-finance/shared';
import { nearFn } from '@honeycomb-finance/wallet-connectors';
import { Pair, TokenAmount } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';

/**
 * this hook is used to fetch total supply of given Near pair
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function useNearPairTotalSupply(pair?: Pair): TokenAmount | undefined {
  const chainId = useChainId();

  const [totalSupply, setTotalSupply] = useState<TokenAmount>();

  useEffect(() => {
    async function getTotalSupply() {
      if (pair && pair instanceof Pair) {
        const pool = await nearFn.getPool(chainId, pair?.token0, pair?.token1);
        const totalSupplyAmt = new TokenAmount(pair?.liquidityToken, pool?.shares_total_supply);
        setTotalSupply(totalSupplyAmt);
      }
    }

    getTotalSupply();
  }, [pair, chainId]);

  return useMemo(() => totalSupply, [totalSupply]);
}
