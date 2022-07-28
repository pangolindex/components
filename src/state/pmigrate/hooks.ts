import { Pair } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { usePairs } from '../../data/Reserves';
import { useChainId, usePangolinWeb3 } from '../../hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from '../puser/hooks';
import { useTokenBalancesWithLoadingIndicator } from '../pwallet/hooks';

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
