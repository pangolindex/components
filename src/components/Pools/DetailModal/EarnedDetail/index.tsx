import { TokenAmount } from '@pangolindex/sdk';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stat, Text } from 'src/components';
import { BIG_INT_ZERO } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { useMinichefPendingRewards } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import ClaimDrawer from '../../ClaimDrawer';
import RemoveDrawer from '../../RemoveDrawer';
import { InnerWrapper, Wrapper } from './styleds';

export interface EarnDetailProps {
  stakingInfo: StakingInfo;
  version: number;
}

const EarnedDetail = ({ stakingInfo, version }: EarnDetailProps) => {
  const { t } = useTranslation();
  const chainId = useChainId();

  const [isClaimDrawerVisible, setShowClaimDrawer] = useState(false);
  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);

  const { rewardTokensAmount, rewardTokensMultiplier } = useMinichefPendingRewards(stakingInfo);

  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const png = PNG[chainId]; // add PNG as default reward

  const { earnedAmount } = stakingInfo;

  return (
    <Wrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text color="text1" fontSize={[24, 18]} fontWeight={500}>
          {t('dashboardPage.earned')}
        </Text>

        {/* show unstak button */}
        <Button variant="primary" width="100px" height="30px" onClick={() => setShowRemoveDrawer(true)}>
          {t('removeLiquidity.remove')}
        </Button>
      </Box>

      <Box flex="1">
        <InnerWrapper>
          <Box>
            <Stat
              title={t('dashboardPage.earned_weeklyIncome')}
              stat={`${stakingInfo?.rewardRatePerWeek?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}`}
              titlePosition="top"
              titleFontSize={14}
              statFontSize={[20, 18]}
              titleColor="text2"
              currency={png}
            />
          </Box>

          <Box>
            <Stat
              title={t('dashboardPage.earned_totalEarned')}
              stat={`${earnedAmount?.toFixed(6) ?? '0'}`}
              titlePosition="top"
              titleFontSize={14}
              statFontSize={[20, 18]}
              titleColor="text2"
              currency={png}
            />
          </Box>
        </InnerWrapper>

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
      </Box>

      <Box mt={10}>
        <Button
          padding="15px 18px"
          isDisabled={!earnedAmount?.greaterThan(BIG_INT_ZERO)}
          variant="primary"
          onClick={() => setShowClaimDrawer(true)}
        >
          {t('earnPage.claim')}
        </Button>
      </Box>

      <ClaimDrawer
        isOpen={isClaimDrawerVisible}
        onClose={() => {
          setShowClaimDrawer(false);
        }}
        stakingInfo={stakingInfo}
        version={version}
      />
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
export default EarnedDetail;
