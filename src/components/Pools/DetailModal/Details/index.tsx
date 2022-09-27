import { CAVAX, CHAINS, Fraction, Token } from '@pangolindex/sdk';
import numeral from 'numeral';
import React from 'react';
import { Box, CoinDescription } from 'src/components';
import StatDetail from 'src/components/Pools/DetailModal/StatDetail';
import { ANALYTICS_PAGE } from 'src/constants';
import { usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useGetPoolDollerWorth } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import { DetailsContainer } from './styled';

type Props = {
  stakingInfo: StakingInfo;
};

const Details: React.FC<Props> = ({ stakingInfo }) => {
  const { account } = usePangolinWeb3();
  const token0 = stakingInfo?.tokens[0];
  const token1 = stakingInfo?.tokens[1];
  const chainId = useChainId();

  const totalStakedInUsd = CHAINS[chainId]?.mainnet
    ? numeral(stakingInfo.totalStakedInUsd.toSignificant(4)).format('$0.00a')
    : numeral(stakingInfo.totalStakedInUsd).format('$0.00a');

  const yourStakeInUsd = CHAINS[chainId]?.mainnet
    ? stakingInfo?.totalStakedInUsd.multiply(stakingInfo?.stakedAmount).divide(stakingInfo?.totalStakedAmount)
    : undefined;

  const [, stakingTokenPair] = usePair(token0, token1);

  const pair = stakingTokenPair;
  const { userPgl, liquidityInUSD } = useGetPoolDollerWorth(pair);

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'));

  // if pair is available then taking tokens from pair otherwise display tokens from staking info
  // we are taking token from pair because sometime order of tokens is different
  const tokenA = pair?.token0 || token0;
  const tokenB = pair?.token1 || token1;
  const currency0 = tokenA ? unwrappedToken(tokenA, chainId) : undefined;
  const currency1 = tokenB ? unwrappedToken(tokenB, chainId) : undefined;
  const yourLiquidity = liquidityInUSD ? `${numeral(liquidityInUSD).format('$0.00a')}` : '-';

  return (
    <>
      <DetailsContainer>
        <StatDetail
          title={`Total Stake`}
          currency0={currency0}
          currency1={currency1}
          pair={pair}
          totalAmount={`${totalStakedInUsd}`}
          pgl={stakingInfo?.totalStakedAmount}
          link={`${ANALYTICS_PAGE}/#/pair/${pair?.liquidityToken.address}`}
        />

        {userPgl?.greaterThan('0') && (
          <Box mt={25}>
            <StatDetail
              title={`Your Liquidity`}
              currency0={currency0}
              currency1={currency1}
              pair={pair}
              totalAmount={yourLiquidity}
              pgl={userPgl}
              link={`${ANALYTICS_PAGE}/#/account/${account}`}
            />
          </Box>
        )}

        {isStaking && (
          <Box mt={25}>
            <StatDetail
              title={`Your Stake`}
              currency0={currency0}
              currency1={currency1}
              pair={pair}
              totalAmount={`${numeral((yourStakeInUsd as Fraction)?.toFixed(2)).format('$0.00a')}`}
              pgl={stakingInfo?.stakedAmount}
              link={`${ANALYTICS_PAGE}/#/account/${account}`}
            />
          </Box>
        )}
        {currency0 !== CAVAX[chainId] && currency0 instanceof Token && (
          <Box mt={20}>
            <CoinDescription coin={currency0} />
          </Box>
        )}

        {currency1 !== CAVAX[chainId] && currency1 instanceof Token && (
          <Box mt={20}>
            <CoinDescription coin={currency1} />
          </Box>
        )}
      </DetailsContainer>
    </>
  );
};

export default Details;
