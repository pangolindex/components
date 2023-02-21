import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useSubgraphPairs } from 'src/apollo/pairs';
import { useChainId } from 'src/hooks';
import { useHederaTokensMetaData } from 'src/state/pwallet/hooks';
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

// returns undefined if input token is undefined, ,
// Hedera token total supply
export function useHederaTotalSupply(token?: Token): TokenAmount | undefined {
  const tokensMetadata = useHederaTokensMetaData([token?.address]);

  const totalSupply = token?.address ? tokensMetadata[token?.address]?.totalSupply : '0';

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

/**
 * this hook is used to fetch total supply of given EVM pair
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function useEvmPairTotalSupply(pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;
  return useTotalSupply(token);
}

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

/**
 * this hook is used to fetch total supply of given pair via subgraph
 * @param pair pair object
 * @returns total supply in form of TokenAmount or undefined
 */
export function usePairTotalSupplyViaSubgraph(pair?: Pair): TokenAmount | undefined {
  const token = pair?.liquidityToken;
  // get pair from subgraph
  const { data, isLoading } = useSubgraphPairs([token?.address]);

  return useMemo(() => {
    if (!token || isLoading || !data || data.length === 0) return undefined;

    const pairInfo = data[0];
    if (pairInfo.id !== token.address) return undefined;

    return new TokenAmount(token, pairInfo.totalSupply);
  }, [token, data, isLoading]);
}
