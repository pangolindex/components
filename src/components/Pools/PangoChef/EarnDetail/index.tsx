import { formatEther } from '@ethersproject/units';
import { TokenAmount } from '@pangolindex/sdk';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Drawer, Stat, Text, Tooltip } from 'src/components';
import { BIG_INT_ZERO } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { useIsLockingPoolZero } from 'src/state/ppangoChef/hooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useMinichefPendingRewards } from 'src/state/pstake/hooks';
import { unwrappedToken } from 'src/utils/wrappedCurrency';
import RemoveDrawer from '../../RemoveDrawer';
import ClaimRewardV3 from '../ClaimReward';
import CompoundV3 from '../Compound';
import { Buttons, Container, InnerWrapper, Wrapper } from './styleds';

export interface EarnDetailProps {
  stakingInfo: PangoChefInfo;
  version: number;
}

const EarnedDetailV3 = ({ stakingInfo, version }: EarnDetailProps) => {
  const chainId = useChainId();
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

  const isDisabledButtons = !earnedAmount?.greaterThan(BIG_INT_ZERO);

  const png = PNG[chainId];

  const lockingPoolZeroPairs = useIsLockingPoolZero();
  const isLockingToPoolZero = lockingPoolZeroPairs.length > 0 && stakingInfo.pid === '0';

  return (
    <Wrapper>
      <Box display="flex" justifyContent="space-between">
        <Text color="text1" fontSize={[24, 18]} fontWeight={500}>
          {t('dashboardPage.earned')}
        </Text>

        {/* show unstak button */}
        <Button
          variant="primary"
          width="100px"
          height="30px"
          onClick={() => setShowRemoveDrawer(true)}
          isDisabled={isLockingToPoolZero}
        >
          {t('removeLiquidity.remove')}
        </Button>
      </Box>

      <Container>
        <Box width="100%">
          <Text fontSize="12px" color="text1" textAlign="center">
            {t('earn.unclaimedReward', { symbol: png.symbol })}
          </Text>
          <Tooltip id="earnedAmount" effect="solid" backgroundColor={theme.primary}>
            <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
              {formatEther(earnedAmount.raw.toString())} {png.symbol}
            </Text>
          </Tooltip>
          <Text color="text1" fontSize="16px" fontWeight={700} textAlign="center" data-tip data-for="earnedAmount">
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
            {isLockingToPoolZero
              ? `${t('pangoChef.lockingPoolZeroWarning')}${lockingPoolZeroPairs
                  .map(
                    (pair) => `${unwrappedToken(pair[0], chainId).symbol}-${unwrappedToken(pair[1], chainId).symbol}`,
                  )
                  .join(', ')}.`
              : t('pangoChef.claimWarning1')}
          </Text>
        </Box>
      </Container>

      <Buttons>
        <Button
          padding="10px"
          variant="outline"
          isDisabled={isDisabledButtons || isLockingToPoolZero}
          onClick={() => setShowClaimDrawer(true)}
          color={!isDisabledButtons && !isLockingToPoolZero ? theme.text10 : undefined}
        >
          {t('earnPage.claim')}
        </Button>
        <Button
          padding="10px"
          isDisabled={isDisabledButtons}
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
        {isCompoundDrawerVisible && (
          <CompoundV3 onClose={() => setShowCompoundDrawer(false)} stakingInfo={stakingInfo} />
        )}
      </Drawer>
      <RemoveDrawer
        isOpen={isRemoveDrawerVisible}
        onClose={() => {
          setShowRemoveDrawer(false);
        }}
        stakingInfo={stakingInfo}
        version={version}
        redirectToCompound={redirectToCompound}
      />
    </Wrapper>
  );
};
export default EarnedDetailV3;
