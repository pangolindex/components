import { ChainId, JSBI, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { BIG_INT_ZERO, PANGOLIN_API_BASE_URL, PNG, USDC, USDCe } from '@honeycomb/shared';
import axios from 'axios';
import { DoubleSideStakingInfo } from './types';

const pangolinApi = axios.create({
  baseURL: PANGOLIN_API_BASE_URL,
  timeout: 10000,
});

// Each APR request performs an upper bound of (6 + 11n) subrequests where n = pid count
// API requests cannot exceed 50 subrequests and therefore `chunkSize` is set to 4
// ie (6 + 11(4)) = 50

export interface AprResult {
  swapFeeApr: number;
  stakingApr: number;
  combinedApr: number;
}

export async function fetchChunkedAprs(pids: string[], chainId: ChainId, chunkSize = 4) {
  const pidChunks: string[][] = [];

  for (let i = 0; i < pids.length; i += chunkSize) {
    const pidChunk = pids.slice(i, i + chunkSize);
    pidChunks.push(pidChunk);
  }

  const chunkedResults = await Promise.all(
    pidChunks.map((chunk) => pangolinApi.get<AprResult[]>(`/v2/${chainId}/pangolin/aprs/${chunk.join(',')}`)),
  );

  const datas = chunkedResults.map((response) => response.data);

  return datas.flat();
}

export function sortingOnAvaxStake(info_a: DoubleSideStakingInfo, info_b: DoubleSideStakingInfo) {
  // only first has ended
  if (info_a.isPeriodFinished && !info_b.isPeriodFinished) return 1;
  // only second has ended
  if (!info_a.isPeriodFinished && info_b.isPeriodFinished) return -1;
  // greater stake in avax comes first
  return info_a.totalStakedInUsd?.greaterThan(info_b.totalStakedInUsd ?? BIG_INT_ZERO) ? -1 : 1;
}

export function sortingOnStakedAmount(info_a: DoubleSideStakingInfo, info_b: DoubleSideStakingInfo) {
  // only the first is being staked, so we should bring the first up
  if (info_a.stakedAmount.greaterThan(BIG_INT_ZERO) && !info_b.stakedAmount.greaterThan(BIG_INT_ZERO)) return -1;
  // only the second is being staked, so we should bring the first down
  if (!info_a.stakedAmount.greaterThan(BIG_INT_ZERO) && info_b.stakedAmount.greaterThan(BIG_INT_ZERO)) return 1;
  return 0;
}

export function calculateTotalStakedAmountInAvax(
  amountStaked: JSBI,
  amountAvailable: JSBI,
  reserveInWavax: JSBI,
  chainId: ChainId,
): TokenAmount {
  if (JSBI.GT(amountAvailable, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[chainId],
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(amountStaked, reserveInWavax),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
        ),
        amountAvailable,
      ),
    );
  } else {
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));
  }
}

export function calculateTotalStakedAmountInAvaxFromPng(
  amountStaked: JSBI,
  amountAvailable: JSBI,
  avaxPngPairReserveOfPng: JSBI,
  avaxPngPairReserveOfWavax: JSBI,
  reserveInPng: JSBI,
  chainId: ChainId,
): TokenAmount {
  if (JSBI.EQ(amountAvailable, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));
  }

  const oneToken = JSBI.BigInt(1000000000000000000);
  const avaxPngRatio = JSBI.divide(JSBI.multiply(oneToken, avaxPngPairReserveOfWavax), avaxPngPairReserveOfPng);
  const valueOfPngInAvax = JSBI.divide(JSBI.multiply(reserveInPng, avaxPngRatio), oneToken);

  return new TokenAmount(
    WAVAX[chainId],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(amountStaked, valueOfPngInAvax),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      amountAvailable,
    ),
  );
}

export function getExtraTokensWeeklyRewardRate(
  rewardRatePerWeek: TokenAmount,
  token: Token,
  tokenMultiplier: JSBI | undefined,
) {
  const png = PNG[token.chainId];
  const EXPONENT = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals));

  const rewardMultiplier = JSBI.BigInt(tokenMultiplier || 1);

  const unadjustedRewardPerWeek = JSBI.multiply(rewardMultiplier, rewardRatePerWeek?.raw);

  const finalReward = JSBI.divide(unadjustedRewardPerWeek, EXPONENT);

  return new TokenAmount(token, finalReward);
}

export const tokenComparator = (
  { address: addressA }: { address: string },
  { address: addressB }: { address: string },
) => {
  // Sort AVAX last
  if (addressA === WAVAX[ChainId.AVALANCHE].address) return 1;
  else if (addressB === WAVAX[ChainId.AVALANCHE].address) return -1;
  // Sort PNG first
  else if (addressA === PNG[ChainId.AVALANCHE].address) return -1;
  else if (addressB === PNG[ChainId.AVALANCHE].address) return 1;
  // Sort USDC first
  else if (addressA === USDC[ChainId.AVALANCHE].address) return -1;
  else if (addressB === USDC[ChainId.AVALANCHE].address) return 1;
  // Sort USDCe first
  else if (addressA === USDCe[ChainId.AVALANCHE].address) return -1;
  else if (addressB === USDCe[ChainId.AVALANCHE].address) return 1;
  else return 0;
};
