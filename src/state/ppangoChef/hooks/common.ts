import { BigNumber } from '@ethersproject/bignumber';
import { JSBI, Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { PNG } from 'src/constants/tokens';
import { usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useTokensCurrencyPriceHook } from 'src/hooks/multiChainsHooks';
import { usePangoChefContract } from 'src/hooks/useContract';
import { useSingleContractMultipleData } from '../../pmulticall/hooks';
import { PangoChefInfo } from '../types';
import { usePangoChefInfosHook } from './index';

/**
 * This hook return the apr of a user
 *
 * @param stakingInfo Staking info provided by usePangoChefInfos
 * @returns return the apr of user
 */
export function useUserPangoChefAPR(stakingInfo?: PangoChefInfo) {
  const chainId = useChainId();

  const png = PNG[chainId];
  const wavax = WAVAX[chainId];

  const [, pair] = usePair(png, wavax);

  return useMemo(() => {
    if (!stakingInfo || !pair) return '0';

    const userRewardRate = stakingInfo.userRewardRate;
    const pngPrice = pair.priceOf(png, wavax);

    const pairPrice = stakingInfo.pairPrice;
    const balance = stakingInfo.stakedAmount;

    const pairBalance = pairPrice.raw.multiply(balance);

    //userApr = userRewardRate(POOL_ID, USER_ADDRESS) * 365 days * 100 * PNG_PRICE / ((getUser(POOL_ID, USER_ADDRESS).valueVariables.balance * STAKING_TOKEN_PRICE) * 1e(png.decimals))
    return pairPrice.equalTo('0') || balance.equalTo('0')
      ? '0'
      : pngPrice.raw
          .multiply(userRewardRate.mul(86400).mul(365).mul(100).toString())
          .divide(pairBalance.multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals))))
          .toFixed(2);
  }, [stakingInfo, pair, png, wavax]);
}

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
  rewardRate: BigNumber,
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

  const pairPrice: Price | undefined = stakingInfo.pairPrice;

  const png = PNG[chainId];
  const tokensPrices = useTokensCurrencyPrice([..._rewardTokens, png]);

  const _rewarRate = balance.multiply(stakingInfo.poolRewardRate.toString()).divide(stakingInfo.totalStakedAmount);

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
      const pngPrice = tokensPrices[png.address];

      const multiplier = multipliers[index];
      if (!pngPrice || !tokenPrice || !multiplier) {
        continue;
      }

      const pairBalance = pairPrice.raw.multiply(balance);

      //extraAPR = poolRewardRate(POOL_ID) * rewardMultiplier / (10** REWARD_TOKEN_PRICE.decimals) * 365 days * 100 * REWARD_TOKEN_PRICE / (pools(POOL_ID).valueVariables.balance * STAKING_TOKEN_PRICE)
      extraAPR =
        !pngPrice || !tokenPrice || pairBalance.equalTo('0') || pngPrice.equalTo('0')
          ? 0
          : Number(
              tokenPrice.raw
                .multiply(_rewarRate)
                .multiply((365 * 86400 * 100).toString())
                .multiply(multiplier)
                .divide(pairBalance.multiply(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals))))
                .divide((10 ** token.decimals).toString())
                .toSignificant(2),
            );
    }

    return extraAPR;
  }, [rewardTokens, rewardRate, multipliers, balance, pairPrice, tokensPrices, _rewardTokens]);
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
