import { JSBI, Pair, Price, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { BIG_INT_ZERO } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { PangoChefInfo, PoolType } from 'src/state/ppangoChef/types';
import { MinichefStakingInfo } from 'src/state/pstake/types';

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
  } as MinichefStakingInfo;
};

export const useGetPangoChefInfos = (): PangoChefInfo => {
  const miniChefInfo = useGetMinichefStakingInfos();

  const wavax = miniChefInfo.tokens[1];
  const pair = new Token(433114, ' 0xd7538cABBf8605BdE1f4901B47B8D42c61DE0367', 18, 'PGL', 'Pangolin Liquidity');

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
    userRewardRate: BigNumber.from('1000000000000000'),
    pairPrice: new Price(pair, wavax, '1', '20'),
    poolType: PoolType.ERC20_POOL,
  } as PangoChefInfo;
};
