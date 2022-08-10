import { Pair } from '@pangolindex/sdk';
import { Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useNearPairs, usePairs } from 'src/data/Reserves';
import { useNearTokens } from 'src/hooks/Tokens';
import { nearFn } from 'src/utils/near';
import { useChainId, usePangolinWeb3 } from '../../hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from '../puser/hooks';
import { useNearTokenBalances, useTokenBalancesWithLoadingIndicator } from '../pwallet/hooks';

export function useGetUserLP() {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();

  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map((tokens) => ({
        liquidityToken: toV2LiquidityToken(tokens, chainId),
        tokens,
      })),
    [trackedTokenPairs, chainId],
  );

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  );

  //fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  );

  const lpTokensWithBalances = useMemo(
    () => liquidityTokensWithBalances.map(({ tokens }) => tokens),
    [liquidityTokensWithBalances],
  );
  const v2Pairs = usePairs(lpTokensWithBalances);

  const v2IsLoading =
    fetchingV2PairBalances ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    v2Pairs?.some((V2Pair) => !V2Pair);

  const allV2PairsWithLiquidity = useMemo(
    () => v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair)),
    [v2Pairs],
  );

  const pairWithLpTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map(({ tokens }) => tokens),
    [tokenPairsWithLiquidityTokens],
  );
  const v2AllPairs = usePairs(pairWithLpTokens);

  const allV2AllPairsWithLiquidity = useMemo(
    () => v2AllPairs.map(([, pair]) => pair).filter((_v2AllPairs): _v2AllPairs is Pair => Boolean(_v2AllPairs)),
    [v2AllPairs],
  );

  return useMemo(
    () => ({ v2IsLoading, allV2PairsWithLiquidity, allPairs: allV2AllPairsWithLiquidity }),
    [v2IsLoading, allV2PairsWithLiquidity, allV2AllPairsWithLiquidity],
  );
}

export function useGetNearUserLP() {
  const { account } = usePangolinWeb3();

  const { isLoading: v2IsLoading, data: pools = [] } = useQuery(['getYourPools'], async () => {
    return await nearFn.getYourPools();
  });

  const allTokenAddress = useMemo(() => {
    let toekAddresses = [] as Array<string>;

    for (let i = 0; i < pools?.length; i++) {
      toekAddresses = [...toekAddresses, ...pools?.[i]?.token_account_ids];
    }

    return [...new Set(toekAddresses)];
  }, [pools]);

  const allTokens = useNearTokens(allTokenAddress);

  const allTokenMeta = useMemo(() => {
    if (allTokens && allTokens.length > 0 && allTokenAddress.length === allTokens.length) {
      const tokensObj = {};

      for (let i = 0; i < allTokens?.length; i++) {
        tokensObj[allTokens?.[i]?.address as string] = allTokens[i];
      }

      return tokensObj;
    }
    return {};
  }, [allTokens, allTokenAddress]);

  const liquidityTokens = useMemo(() => {
    if (allTokens && allTokens.length > 0 && Object.keys(allTokenMeta).length === allTokens.length) {
      const allLPTokens: [Token, Token][] = (pools || []).map((pool) => {
        const tokens = pool?.token_account_ids.map((address) => {
          const token = allTokenMeta[address];
          return token as Token;
        });
        return [tokens?.[0], tokens?.[1]];
      });

      return allLPTokens;
    }

    return [];
  }, [allTokens, pools, allTokenMeta]);

  const v2AllPairs = useNearPairs(liquidityTokens);

  const allV2Pairs = useMemo(
    () => v2AllPairs.map(([, pair]) => pair).filter((_v2AllPairs): _v2AllPairs is Pair => Boolean(_v2AllPairs)),
    [v2AllPairs],
  );

  const v2PairsBalances = useNearTokenBalances(account ?? undefined, allV2Pairs);

  console.log('relevantPairBalances', v2PairsBalances);

  //fetch the reserves for all V2 pools in which the user has a balance
  const allV2PairsWithLiquidity = useMemo(
    () => allV2Pairs.filter(({ liquidityToken }) => v2PairsBalances[liquidityToken.address]?.greaterThan('0')),
    [allV2Pairs, v2PairsBalances],
  );

  const pairs = liquidityTokens.length > 0 ? allV2PairsWithLiquidity : [];

  return useMemo(() => ({ v2IsLoading, allV2PairsWithLiquidity: pairs }), [v2IsLoading, pairs]);
}
