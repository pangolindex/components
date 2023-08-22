import { Box, DoubleCurrencyLogo, Drawer, RewardTokens, Stat, Text } from '@pangolindex/core';
import { CHAINS, Fraction, JSBI, Token } from '@pangolindex/sdk';
import { BIG_INT_ZERO, unwrappedToken, useChainId, usePangolinWeb3 } from '@pangolindex/shared';
import { usePair } from '@pangolindex/state-hooks';
import numeral from 'numeral';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePangoChefExtraFarmApr } from 'src/hooks/pangochef/hooks/common';
import { PangoChefInfo } from 'src/hooks/pangochef/types';
import { usePairBalanceHook } from 'src/hooks/wallet/hooks';
import AddLiquidityDrawer from '../AddLiquidityDrawer';
import FarmDrawer from '../FarmDrawer';
import CompoundV3 from '../PangoChef/Compound';
import {
  ActionButon,
  DetailButton,
  Divider,
  ExpireButton,
  InnerWrapper,
  OptionButton,
  OptionsWrapper,
  Panel,
  StatWrapper,
} from './styleds';

export interface PoolCardViewProps {
  stakingInfo: PangoChefInfo;
  onClickViewDetail: () => void;
  version: number;
  rewardTokens?: Array<Token | null | undefined> | null;
}

const PoolCardViewV3 = ({ stakingInfo, onClickViewDetail, version, rewardTokens }: PoolCardViewProps) => {
  const { t } = useTranslation();
  const [isCompoundDrawerVisible, setShowCompoundDrawer] = useState(false);

  const [isFarmDrawerVisible, setShowFarmDrawer] = useState(false);
  const [isAddLiquidityDrawerVisible, setShowAddLiquidityDrawer] = useState(false);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const usePairBalance = usePairBalanceHook[chainId];

  const token0 = stakingInfo?.tokens?.[0];
  const token1 = stakingInfo?.tokens?.[1];

  const currency0 = unwrappedToken(token0, chainId);
  const currency1 = unwrappedToken(token1, chainId);

  const [, stakingTokenPair] = usePair(token0, token1);

  const userStakedAmount = stakingInfo?.stakedAmount;
  const isStaking = Boolean(userStakedAmount?.greaterThan('0'));

  const yourStackedInUsd = CHAINS[chainId]?.mainnet
    ? stakingInfo?.totalStakedInUsd.multiply(userStakedAmount).divide(stakingInfo?.totalStakedAmount)
    : undefined;

  const userPgl = usePairBalance(account ?? undefined, stakingTokenPair ?? undefined);

  const isLiquidity = Boolean(userPgl?.greaterThan('0'));

  const isSuperFarm = (stakingInfo?.rewardTokensAddress || [])?.length > 0;

  const redirectToFarmDrawer = () => {
    setShowFarmDrawer(true);
    setShowAddLiquidityDrawer(false);
  };

  const farmApr = stakingInfo?.stakingApr;

  const userApr = stakingInfo.userApr;

  const userRewardRate = stakingInfo?.userRewardRate;
  const rewardRate = isStaking ? userRewardRate : stakingInfo?.poolRewardRate;
  const balance = isStaking ? userStakedAmount : stakingInfo?.totalStakedAmount;

  const extraAPR = usePangoChefExtraFarmApr(rewardTokens, rewardRate, balance, stakingInfo);
  const apr = isStaking ? userApr : farmApr;

  const totalApr = (apr ?? 0) + extraAPR;

  const renderButton = () => {
    // if multiplier is zero don't need to show compound button, because this farm not give rewards
    if (isStaking && JSBI.greaterThan(stakingInfo.multiplier, JSBI.BigInt(0)))
      return (
        <ActionButon
          variant="plain"
          onClick={() => setShowCompoundDrawer(true)}
          backgroundColor="color2"
          color="text1"
          height="45px"
        >
          {t('sarCompound.compound')}
        </ActionButon>
      );
    else if (isLiquidity) {
      return (
        <ActionButon
          variant="plain"
          onClick={() => setShowFarmDrawer(true)}
          backgroundColor="color2"
          color="text1"
          height="45px"
          isDisabled={!JSBI.greaterThan(stakingInfo.multiplier, JSBI.BigInt(0))}
        >
          {t('header.farm')}
        </ActionButon>
      );
    } else {
      return (
        <ActionButon
          variant="plain"
          onClick={() => setShowAddLiquidityDrawer(true)}
          backgroundColor="color2"
          color="text1"
          height="45px"
        >
          {t('pool.addLiquidity')}
        </ActionButon>
      );
    }
  };

  return (
    <Panel>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Text color="text1" fontSize={24} fontWeight={500}>
            {currency0.symbol}-{currency1.symbol}
          </Text>

          <Box display="flex" alignItems="center">
            {isSuperFarm && (
              <OptionsWrapper>
                <OptionButton>Super farm</OptionButton>
              </OptionsWrapper>
            )}

            {!JSBI.greaterThan(stakingInfo.multiplier, BIG_INT_ZERO) && (
              <OptionsWrapper>
                <ExpireButton>Expired</ExpireButton>
              </OptionsWrapper>
            )}
          </Box>
        </Box>

        <DoubleCurrencyLogo size={48} currency0={currency0} currency1={currency1} />
      </Box>
      <Divider />

      <Box display="flex" flex="1" alignItems="center">
        <StatWrapper>
          {isStaking ? (
            <Stat
              title={t('pool.yourTVL')}
              stat={numeral((yourStackedInUsd as Fraction)?.toFixed(2)).format('$0.00a')}
              titlePosition="top"
              titleFontSize={[16, 14]}
              statFontSize={[24, 18]}
            />
          ) : (
            <Stat
              title={'TVL'}
              stat={numeral((stakingInfo?.totalStakedInUsd as Fraction)?.toFixed(2)).format('$0.00a')}
              titlePosition="top"
              titleFontSize={14}
              statFontSize={18}
            />
          )}

          <Stat
            title={isStaking ? `${t('pool.yourAPR')}` : `${t('pool.averageAPR')}`}
            stat={apr !== undefined ? `${numeral(totalApr).format('0a')}%` : '-'}
            titlePosition="top"
            titleFontSize={[16, 14]}
            statFontSize={[24, 18]}
          />

          <Box display="inline-block">
            <Text color="text1" fontSize={[16, 14]}>
              {t('earn.rewardsIn')}
            </Text>

            <Box display="flex" alignItems="center" mt="5px">
              <RewardTokens rewardTokens={rewardTokens} size={24} />
            </Box>
          </Box>
        </StatWrapper>
      </Box>

      <InnerWrapper>
        <Box>
          <DetailButton variant="plain" onClick={onClickViewDetail} color="text1" height="45px">
            {t('pool.seeDetails')}
          </DetailButton>
        </Box>
        <Box>{renderButton()}</Box>
      </InnerWrapper>
      {isCompoundDrawerVisible && (
        <Drawer
          title={t('sarCompound.compound')}
          isOpen={isCompoundDrawerVisible}
          onClose={() => setShowCompoundDrawer(false)}
          backgroundColor="color5"
        >
          <CompoundV3 onClose={() => setShowCompoundDrawer(false)} stakingInfo={stakingInfo} />
        </Drawer>
      )}

      {isFarmDrawerVisible && (
        <FarmDrawer
          isOpen={isFarmDrawerVisible}
          onClose={() => {
            setShowFarmDrawer(false);
          }}
          version={version}
          backgroundColor="color5"
          stakingInfo={stakingInfo}
          combinedApr={farmApr}
        />
      )}

      {isAddLiquidityDrawerVisible && (
        <AddLiquidityDrawer
          isOpen={isAddLiquidityDrawerVisible}
          onClose={() => {
            setShowAddLiquidityDrawer(false);
          }}
          onAddToFarm={redirectToFarmDrawer}
          clickedLpTokens={stakingInfo?.tokens}
          backgroundColor="color5"
        />
      )}
    </Panel>
  );
};

export default PoolCardViewV3;
