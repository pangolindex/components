import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useChainId } from 'src/hooks';
import { nearFn } from 'src/utils/near';
import { PNG } from '../constants/tokens';
import { useTokenContract } from '../hooks/useContract';
import { useSingleCallResult } from '../state/pmulticall/hooks';

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const totalSupply: BigNumber = useSingleCallResult(contract, 'totalSupply')?.result?.[0];

  // Special case to handle PNG's proxy burnt total supply
  if (token?.equals(PNG[ChainId.AVALANCHE])) {
    return new TokenAmount(token, '230000000000000000000000000');
  }

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined;
}

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

export type UseTotalSupplyHookType = {
  [chainId in ChainId]: typeof useTotalSupply | typeof useNearTotalSupply;
};

export const useTotalSupplyHook: UseTotalSupplyHookType = {
  [ChainId.FUJI]: useTotalSupply,
  [ChainId.AVALANCHE]: useTotalSupply,
  [ChainId.WAGMI]: useTotalSupply,
  [ChainId.COSTON]: useTotalSupply,
  [ChainId.SONGBIRD]: useTotalSupply,
  [ChainId.NEAR_MAINNET]: useNearTotalSupply,
  [ChainId.NEAR_TESTNET]: useNearTotalSupply,
};
