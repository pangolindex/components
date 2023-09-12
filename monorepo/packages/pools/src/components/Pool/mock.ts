import { Fraction, JSBI, Pair, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { BIG_INT_ZERO, PNG, useChainId } from '@honeycomb/shared';
import { BigNumber } from 'ethers';
import { MinichefStakingInfo } from 'src/hooks/minichef/types';
import { PangoChefInfo } from 'src/hooks/pangochef/types';

// get data for all farms
export const useGetMinichefStakingInfos = (): MinichefStakingInfo => {
  const chainId = useChainId();
  const png = PNG[chainId];

  const totalStakedInWavax = new TokenAmount(WAVAX[chainId], BIG_INT_ZERO);
  const tokenA = new Token(43114, '0x60781C2586D68229fde47564546784ab3fACA982', 18, 'PNG', 'Pangolin');
  const tokenB = new Token(43114, '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 18, 'WAVAX', 'Wrapped AVAX');
  const tokens = [tokenA, tokenB];

  const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
  const lpToken = dummyPair.liquidityToken;

  const totalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(0));
  const totalStakedInUsd = new TokenAmount(lpToken, JSBI.BigInt(0));

  const rewardRatePerWeek = new TokenAmount(png, JSBI.BigInt(0));
  const totalRewardRatePerSecond = new TokenAmount(png, JSBI.BigInt(0));
  const totalRewardRatePerWeek = new TokenAmount(png, JSBI.BigInt(0));
  const stakedAmount = new TokenAmount(lpToken, JSBI.BigInt(0));
  const earnedAmount = new TokenAmount(png, JSBI.BigInt(0));
  return {
    stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
    pid: '0',
    tokens: [tokenA, tokenB],
    multiplier: JSBI.BigInt(3800),
    isPeriodFinished: false,
    totalStakedAmount: totalStakedAmount,
    totalStakedInUsd: totalStakedInUsd,
    rewardRatePerWeek: rewardRatePerWeek,
    totalRewardRatePerSecond: totalRewardRatePerSecond,
    totalRewardRatePerWeek: totalRewardRatePerWeek,
    stakedAmount: stakedAmount,
    earnedAmount: earnedAmount,
    rewardsAddress: '0x0000000000000000000000000000000000000000',
    periodFinish: undefined,
    totalStakedInWavax: totalStakedInWavax,
    rewardTokens: [tokenA],
    getHypotheticalWeeklyRewardRate: () => {
      return new TokenAmount(png, JSBI.BigInt(0));
    },
    extraPendingRewards: [],
  } as MinichefStakingInfo;
};

export const useGetPangoChefInfos = (): PangoChefInfo => {
  const miniChefInfo = useGetMinichefStakingInfos();

  return {
    ...miniChefInfo,
    valueVariables: {
      balance: BigNumber.from('10000000000000000000'),
      sumOfEntryTimes: BigNumber.from('10000000000000000000'),
    },
    userValueVariables: {
      balance: BigNumber.from('1000000000000000000'),
      sumOfEntryTimes: BigNumber.from('1000000000000000000'),
    },
    userRewardRate: new Fraction('1000000000000000'),
    pairPrice: new Fraction('1', '20'),
    poolRewardRate: new Fraction('1000', '1'),
    userApr: 0,
    lockCount: undefined,
  } as PangoChefInfo;
};
