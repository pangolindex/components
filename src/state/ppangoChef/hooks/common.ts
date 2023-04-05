import { BigNumber } from '@ethersproject/bignumber';
import { Fraction, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokensCurrencyPriceHook } from 'src/hooks/multiChainsHooks';
import { usePangoChefContract } from 'src/hooks/useContract';
import { useSingleContractMultipleData } from '../../pmulticall/hooks';
import { PangoChefInfo } from '../types';
import { usePangoChefInfosHook } from './index';

/**
 * This hook returns the extra value provided by super farm extra reward tokens
 * @param rewardTokens array os tokens
 * @param rewardRate reward rate in png/s
 * @param multipliers multipler fro each token provider in rewardTokens
 * @param balance valueVariables from contract
 * @returns return the extra percentage of apr provided by super farm extra reward tokens
 */
export function usePangoChefExtraFarmApr(
  rewardTokens: Array<Token | null | undefined> | null | undefined,
  rewardRate: Fraction,
  balance: TokenAmount,
  stakingInfo: PangoChefInfo,
) {
  const chainId = useChainId();
  const useTokensCurrencyPrice = useTokensCurrencyPriceHook[chainId];
  // remove png and null
  const _rewardTokens = (rewardTokens?.filter((token) => !!token && !PNG[chainId].equals(token)) || []) as (
    | Token
    | undefined
  )[];

  const multipliers = stakingInfo.rewardTokensMultiplier;

  const pairPrice: Fraction | undefined = stakingInfo.pairPrice;

  const png = PNG[chainId];
  const tokensPrices = useTokensCurrencyPrice(_rewardTokens);

  // we need to divide by png.decimals
  const aprDenominator = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals));

  return useMemo(() => {
    let extraAPR = 0;

    if (!rewardTokens || !multipliers || _rewardTokens.length === 0) {
      return extraAPR;
    }

    for (let index = 0; index < _rewardTokens.length; index++) {
      const token = _rewardTokens[index];

      if (!token) {
        continue;
      }

      const tokenPrice = tokensPrices[token.address];

      const multiplier = multipliers[index];
      if (!tokenPrice || !multiplier || !pairPrice) {
        continue;
      }

      const pairBalance = pairPrice.multiply(balance);

      //extraAPR = poolRewardRate(POOL_ID) * rewardMultiplier / (10** REWARD_TOKEN_PRICE.decimals) * 365 days * 100 * REWARD_TOKEN_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      extraAPR =
        !tokenPrice || pairBalance.equalTo('0')
          ? 0
          : Number(
              tokenPrice.raw
                .multiply(rewardRate)
                .multiply((365 * 86400 * 100).toString())
                .multiply(multiplier)
                .divide(pairBalance.multiply(aprDenominator))
                .divide((10 ** token.decimals).toString())
                .toSignificant(2),
            );
    }

    return extraAPR;
  }, [rewardTokens, multipliers, balance, pairPrice, tokensPrices, _rewardTokens, rewardRate]);
}

/**
 * this hook is basically for PangoChef v1, which is only used by Songbird right now
 * this hook returns pairs which are locking Pool Zero
 * @returns [Token, Token][] pairs array
 */
export function useGetLockingPoolsForPoolZero() {
  const chainId = useChainId();
  const usePangoChefInfos = usePangoChefInfosHook[chainId];

  const stakingInfos = usePangoChefInfos();

  const pairs: [Token, Token][] = useMemo(() => {
    const _pairs: [Token, Token][] = [];
    stakingInfos?.forEach((stakingInfo) => {
      if (stakingInfo?.lockCount && stakingInfo?.lockCount > 0) {
        const [token0, token1] = stakingInfo.tokens;
        _pairs.push([token0, token1]);
      }
    });
    return _pairs;
  }, [stakingInfos]);

  return pairs;
}

/**
 * To get how many pools locked to given pool
 * @param poolId
 * @returns  [Token, Token][] pairs array
 */
export function useGetLockingPoolsForPoolId(poolId: string) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();

  const usePangoChefInfos = usePangoChefInfosHook[chainId];

  const stakingInfos = usePangoChefInfos();

  const allPoolsIds = useMemo(() => {
    return (stakingInfos || []).map((stakingInfo) => {
      if (!account || !chainId) {
        return undefined;
      }

      return [stakingInfo?.pid?.toString(), account];
    });
  }, [stakingInfos, account, chainId]);

  const lockPoolState = useSingleContractMultipleData(pangoChefContract, 'getLockedPools', allPoolsIds);

  const _lockpools = useMemo(() => {
    const container = {} as { [poolId: string]: Array<string> };

    allPoolsIds.forEach((value, index) => {
      const result = lockPoolState[index]?.result;
      const pid = value?.[0];

      if (result?.[0]?.[0]?.toString() && pid) {
        container[`${pid}`] = result?.[0]?.map((item: BigNumber) => item.toString());
      }
    });

    return container;
  }, [allPoolsIds]);

  const lockingPools = useMemo(() => {
    const internalLockingPools = [] as Array<string>;
    Object.entries(_lockpools).forEach(([pid, pidsLocked]) => {
      if (pidsLocked.includes(poolId?.toString())) {
        internalLockingPools.push(pid);
      }
    });
    return internalLockingPools;
  }, [_lockpools]);

  const pairs: [Token, Token][] = useMemo(() => {
    const _pairs: [Token, Token][] = [];

    if (lockingPools?.length > 0) {
      stakingInfos?.forEach((stakingInfo) => {
        if (lockingPools.includes(stakingInfo?.pid)) {
          const [token0, token1] = stakingInfo.tokens;
          _pairs.push([token0, token1]);
        }
      });
    }

    return _pairs;
  }, [stakingInfos, lockingPools]);

  return pairs;
}
