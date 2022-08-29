import { TokenAmount } from '@pangolindex/sdk';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Drawer, Stat, Text } from 'src/components';
import { BIG_INT_ZERO } from 'src/constants';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useMinichefPendingRewards } from 'src/state/pstake/hooks';
import RemoveDrawer from '../../RemoveDrawer';
import ClaimRewardV3 from '../ClaimReward';
import { Buttons, Container, InnerWrapper, Wrapper } from './styleds';

export interface EarnDetailProps {
  stakingInfo: PangoChefInfo;
  version: number;
}

const EarnedDetailV3 = ({ stakingInfo, version }: EarnDetailProps) => {
  const { t } = useTranslation();

  const [isClaimDrawerVisible, setShowClaimDrawer] = useState(false);
  const [isCompoundDrawerVisible, setShowCompoundDrawer] = useState(false);
  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);

  const { rewardTokensAmount, rewardTokensMultiplier } = useMinichefPendingRewards(stakingInfo);

  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const earnedAmount = stakingInfo?.earnedAmount;

  const redirectToCompound = () => {
    setShowClaimDrawer(false);
    setShowRemoveDrawer(false);
    setShowCompoundDrawer(true);
  };

  const onClose = () => {
    setShowClaimDrawer(false);
    setShowRemoveDrawer(false);
    setShowCompoundDrawer(false);
  };

  const drawerTitle = () => {
    if (isClaimDrawerVisible) {
      return t('earn.claim');
    }
    if (isRemoveDrawerVisible) {
      return t('removeLiquidity.remove');
    }
    return t('sarCompound.compound');
  };

  const theme = useContext(ThemeContext);

  return (
    <Wrapper>
      <Box display="flex" justifyContent="space-between">
        <Text color="text1" fontSize={[24, 18]} fontWeight={500}>
          {t('dashboardPage.earned')}
        </Text>

        {/* show unstak button */}
        <Button variant="primary" width="100px" height="30px" onClick={() => setShowRemoveDrawer(true)}>
          {t('removeLiquidity.remove')}
        </Button>
      </Box>

      <Container>
        <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Text fontSize="12px" color="text1" textAlign="center">
            Unclaimed PNG
          </Text>
          <Text fontSize="18px" fontWeight={700} color="text1" textAlign="center">
            {earnedAmount.toFixed(2)}
          </Text>
        </Box>
        {isSuperFarm && (
          <>
            {(rewardTokensAmount || []).map((reward, index) => {
              const tokenMultiplier = rewardTokensMultiplier?.[index];

              const extraTokenWeeklyRewardRate = stakingInfo?.getExtraTokensWeeklyRewardRate?.(
                stakingInfo?.rewardRatePerWeek,
                reward?.token,
                tokenMultiplier,
              ) as TokenAmount;

              return (
                <InnerWrapper key={index}>
                  <Box>
                    <Stat
                      stat={`${extraTokenWeeklyRewardRate?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} `}
                      statFontSize={[20, 18]}
                      currency={reward?.token}
                    />
                  </Box>

                  <Box>
                    <Stat
                      stat={`${reward?.toFixed(Math.min(6, reward.token?.decimals)) ?? '0'}`}
                      statFontSize={[20, 18]}
                      currency={reward?.token}
                    />
                  </Box>
                </InnerWrapper>
              );
            })}
          </>
        )}
        <Box
          bgColor="color3"
          borderRadius="8px"
          padding="20px"
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <Text fontSize="12px" color="text1" textAlign="center">
            When you claim without withdrawing your liquidity remains in the mining pool.
          </Text>
        </Box>
      </Container>

      <Buttons>
        <Button padding="10px" variant="outline" onClick={() => setShowClaimDrawer(true)} color={theme.text10}>
          {t('earnPage.claim')}
        </Button>
        <Button
          padding="10px"
          isDisabled={!earnedAmount?.greaterThan(BIG_INT_ZERO)}
          variant="primary"
          onClick={() => setShowCompoundDrawer(true)}
        >
          {t('sarCompound.compound')}
        </Button>
      </Buttons>

      <Drawer title={drawerTitle()} isOpen={isClaimDrawerVisible || isCompoundDrawerVisible} onClose={onClose}>
        {isClaimDrawerVisible && (
          <ClaimRewardV3
            onClose={() => setShowClaimDrawer(false)}
            redirectToCompound={redirectToCompound}
            stakingInfo={stakingInfo}
          />
        )}
      </Drawer>
      <RemoveDrawer
        isOpen={isRemoveDrawerVisible}
        onClose={() => {
          setShowRemoveDrawer(false);
        }}
        stakingInfo={stakingInfo}
        version={version}
      />
    </Wrapper>
  );
};
export default EarnedDetailV3;
