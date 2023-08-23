import { Fraction, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { PNG, useChainId, usePangolinWeb3 } from '@pangolindex/shared';
import { useSingleContractMultipleData, useTokensCurrencyPriceHook, useTokensHook } from '@pangolindex/state-hooks';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { usePangoChefContract } from 'src/hooks/useContract';
import { PangoChefInfo } from '../types';
import { usePangoChefInfosHook } from './index';

/**
 * This hook returns the extra value provided by super farm extra reward tokens
 * @param rewardTokens array os tokens
 * @param rewardRate reward rate in png/s
 * @param balance valueVariables from contract
 * @param stakingInfo object containing the information of this farm
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

  const multipliers = stakingInfo?.rewardTokensMultiplier;

  const pairPrice: Fraction | undefined = stakingInfo?.pairPrice;

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
 * This hook returns a mapping, where key is the pid and the value is the farm's extra apr
 * @param stakingInfos array of stakingInfo
 * @returns return the mapping, key is pid, values of key is the extra apr, `{ 0: 10, 1: 0, 2: 5, ...}`
 */
export function usePangoChefUserExtraFarmsApr(stakingInfos: PangoChefInfo[]) {
  const chainId = useChainId();
  const useTokensCurrencyPrice = useTokensCurrencyPriceHook[chainId];
  const useTokens = useTokensHook[chainId];

  const rewardTokensAddresses = useMemo(() => {
    const tokensMapping: { [x: string]: string } = {};
    stakingInfos.forEach(({ rewardTokensAddress }) => {
      rewardTokensAddress?.forEach((address) => {
        tokensMapping[address] = address;
      });
    });
    return Object.values(tokensMapping);
  }, [stakingInfos]);

  const _rewardTokens = useTokens(rewardTokensAddresses);

  const rewardTokens = useMemo(() => {
    if (_rewardTokens) {
      return _rewardTokens.filter((token) => !!token) as Token[];
    }
    return [] as Token[];
  }, [_rewardTokens]);

  const tokensPrices = useTokensCurrencyPrice(rewardTokens);

  const png = PNG[chainId];

  // we need to divide by png.decimals
  const aprDenominator = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals));

  return useMemo(() => {
    const extraAPRs: { [x: string]: number | undefined } = {};

    if (!rewardTokens || rewardTokens.length === 0) {
      return extraAPRs;
    }

    for (let i = 0; i < stakingInfos.length; i++) {
      let extraAPR = 0;
      const stakingInfo = stakingInfos[i];

      const pid = stakingInfo.pid;
      const multipliers = stakingInfo.rewardTokensMultiplier;
      const rewardsTokensAddresses = stakingInfo.rewardTokensAddress;
      const pairPrice: Fraction | undefined = stakingInfo.pairPrice;
      const balance = stakingInfo.stakedAmount;
      const rewardRate = stakingInfo.userRewardRate;

      if (!multipliers || multipliers.length === 0 || !rewardsTokensAddresses || rewardsTokensAddresses.length === 0) {
        continue;
      }

      for (let index = 0; index < rewardsTokensAddresses.length; index++) {
        const tokenAddress = rewardsTokensAddresses[index];
        const token = rewardTokens.find((token) => token.address.toLowerCase() === tokenAddress.toLowerCase());
        const tokenPrice = tokensPrices[tokenAddress];

        const multiplier = multipliers[index];
        if (!tokenPrice || !multiplier || !pairPrice || !token) {
          extraAPRs[pid] = 0;
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
      extraAPRs[pid] = extraAPR;
    }
    return extraAPRs;
  }, [rewardTokens, tokensPrices, stakingInfos]);
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
