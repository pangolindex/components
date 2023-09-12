import { Fraction, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import { PNG, ZERO_ADDRESS, useChainId, usePangolinWeb3, useSubgraphFarmsStakedAmount } from '@honeycomb/shared';
import { useTokensCurrencyPriceHook, useTokensHook, useTransactionAdder } from '@honeycomb/state-hooks';
import { Hedera, hederaFn } from '@honeycomb/wallet-connectors';
import { useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { usePangoChefContract } from 'src/hooks/useContract';
import { PangoChefInfo } from '../types';

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
 * this hook is useful to check whether user has created pangochef storage contract or not
 * if not then using this hook we can create user's storage contract
 * @returns [boolean, function_to_create]
 */
export function useHederaPangochefContractCreateCallback(): [boolean, () => Promise<void>] {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const pangoChefContract = usePangoChefContract();
  const addTransaction = useTransactionAdder();

  // get on chain data
  const { data: userStorageAddress, refetch } = useQuery(
    ['hedera-pangochef-user-storage', account],
    async (): Promise<string | undefined> => {
      try {
        const response = await pangoChefContract?.getUserStorageContract(account);
        return response as string;
      } catch (error) {
        return undefined;
      }
    },
    { enabled: Boolean(pangoChefContract) && Boolean(account) && Hedera.isHederaChain(chainId) },
  );

  // we need on chain fallback
  // because user might have created a storage contract but haven't staked into anything yet
  // if we replace subgraph logic without fallback then user will be stuck forever in
  // "create storage contract" flow because subgraph thinking that there is no farmingPositions
  // but actually user has created storage contract
  const hasOnChainData = typeof userStorageAddress !== 'undefined';
  const onChainShouldCreateStorage = userStorageAddress === ZERO_ADDRESS || !userStorageAddress ? true : false;

  // get off chain data using subgraph
  // we also get data from subgraph just to make sure user doesn't stuck anywhere in flow
  const { data, refetch: refetchSubgraph } = useSubgraphFarmsStakedAmount();
  const offChainShouldCreateStorage = Boolean(!data || data.length === 0);

  const shouldCreateStorage = hasOnChainData ? onChainShouldCreateStorage : offChainShouldCreateStorage;

  const create = useCallback(async (): Promise<void> => {
    if (!account) {
      console.error('no account');
      return;
    }

    try {
      const response = await hederaFn.createPangoChefUserStorageContract(chainId, account);

      if (response) {
        refetch();
        refetchSubgraph();
        addTransaction(response, {
          summary: 'Created Pangochef User Storage Contract',
        });
      }
    } catch (error) {
      console.debug('Failed to create pangochef contract', error);
    }
  }, [account, chainId, addTransaction]);

  if (!Hedera.isHederaChain(chainId)) {
    return [
      false,
      () => {
        return Promise.resolve();
      },
    ];
  }

  return [shouldCreateStorage, create];
}
