import { Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { nearFn , useChainId} from '@pangolindex/shared';
import { useEffect, useMemo, useState } from 'react';

export function useNearTotalSupply(tokenOrPair?: Token | Pair): TokenAmount | undefined {
  const chainId = useChainId();

  const [totalSupply, setTotalSupply] = useState<TokenAmount>();

  useEffect(() => {
    async function getTotalSupply() {
      if (tokenOrPair && tokenOrPair instanceof Pair) {
        const pool = await nearFn.getPool(chainId, tokenOrPair?.token0, tokenOrPair?.token1);

        const totalSupplyAmt = new TokenAmount(tokenOrPair?.liquidityToken, pool?.shares_total_supply);

        setTotalSupply(totalSupplyAmt);
      } else if (tokenOrPair instanceof Token) {
        const totalSupply = await nearFn.getTotalSupply(tokenOrPair?.address);
        const totalSupplyAmt = new TokenAmount(tokenOrPair, totalSupply);

        setTotalSupply(totalSupplyAmt);
      }
    }

    getTotalSupply();
  }, [tokenOrPair, chainId]);

  return useMemo(() => totalSupply, [totalSupply]);
}
