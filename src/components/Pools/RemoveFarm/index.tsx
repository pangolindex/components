import { CHAINS, ChefType } from '@pangolindex/sdk';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { FARM_TYPE } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { usePangoChefWithdrawCallbackHook } from 'src/state/ppangoChef/multiChainsHooks';
import { useGetEarnedAmount, useMinichefPendingRewards } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import RemoveLiquidityDrawer from '../RemoveLiquidityDrawer';
import { Buttons, FarmRemoveWrapper, RewardWrapper, Root, StatWrapper } from './styleds';

interface RemoveFarmProps {
  stakingInfo: StakingInfo;
  version: number;
  onClose: () => void;
  // this prop will be used if user move away from first step
  onLoadingOrComplete?: (value: boolean) => void;
  redirectToCompound?: () => void;
}
const RemoveFarm = ({ stakingInfo, version, onClose, onLoadingOrComplete, redirectToCompound }: RemoveFarmProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const [isRemoveLiquidityDrawerVisible, setShowRemoveLiquidityDrawer] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { t } = useTranslation();

  // monitor call to help UI loading state

  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  const useWithdrawCallback = usePangoChefWithdrawCallbackHook[chainId];

  const png = PNG[chainId];

  const { rewardTokensAmount } = useMinichefPendingRewards(stakingInfo);

  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const chefType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  const mixpanel = useMixpanel();

  const { callback: withdrawCallback, error: withdrawCallbackError } = useWithdrawCallback({
    version,
    poolId: stakingInfo?.pid,
    stakedAmount: stakingInfo?.stakedAmount,
    stakingRewardAddress: stakingInfo?.stakingRewardAddress,
  });

  useEffect(() => {
    if (onLoadingOrComplete) {
      if (hash || attempting || confirmRemove) {
        onLoadingOrComplete(true);
      } else {
        onLoadingOrComplete(false);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, attempting, confirmRemove]);

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    onClose();
  }

  async function onWithdraw() {
    if (stakingInfo?.stakedAmount && withdrawCallback) {
      setAttempting(true);

      try {
        const hash = await withdrawCallback();
        setHash(hash);

        mixpanel.track(MixPanelEvents.REMOVE_FARM, {
          chainId: chainId,
          tokenA: token0,
          tokenB: token1,
          tokenA_Address: token0.address,
          tokenB_Address: token1.address,
          farmType: FARM_TYPE[version]?.toLowerCase(),
        });
      } catch (err) {
        const _err = err as any;
        // we only care if the error is something _other_ than the user rejected the tx
        if (_err?.code !== 4001) {
          console.error(err);
        }
      } finally {
        setAttempting(false);
      }
    }
  }

  let error: string | undefined;
  if (!account) {
    error = t('earn.connectWallet');
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? t('earn.enterAmount');
  }

  if (withdrawCallbackError) {
    error = withdrawCallbackError;
  }

  const { earnedAmount } = useGetEarnedAmount(stakingInfo?.pid as string);

  const newEarnedAmount = version !== 2 ? stakingInfo?.earnedAmount : earnedAmount;

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const cheftType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  return (
    <FarmRemoveWrapper>
      {!attempting && !hash && (
        <Root>
          {!confirmRemove ? (
            <>
              <Box flex="1">
                <RewardWrapper>
                  {stakingInfo?.stakedAmount && (
                    <StatWrapper>
                      <Stat
                        title={t('earn.depositedToken', { symbol: 'PGL' })}
                        stat={stakingInfo?.stakedAmount?.toSignificant(4)}
                        titlePosition="top"
                        titleFontSize={12}
                        statFontSize={[20, 18]}
                        titleColor="text1"
                        statAlign="center"
                      />
                    </StatWrapper>
                  )}
                  {newEarnedAmount && (
                    <StatWrapper>
                      <Stat
                        title={t('earn.unclaimedReward', { symbol: png.symbol })}
                        stat={newEarnedAmount?.toSignificant(4)}
                        titlePosition="top"
                        titleFontSize={12}
                        statFontSize={[20, 18]}
                        titleColor="text1"
                        statAlign="center"
                      />
                    </StatWrapper>
                  )}

                  {isSuperFarm &&
                    rewardTokensAmount?.map((rewardAmount, i) => (
                      <StatWrapper key={i}>
                        <Stat
                          title={t('earn.unclaimedReward', { symbol: rewardAmount?.token?.symbol })}
                          stat={rewardAmount?.toSignificant(4)}
                          titlePosition="top"
                          titleFontSize={12}
                          statFontSize={[20, 18]}
                          titleColor="text1"
                          statAlign="center"
                        />
                      </StatWrapper>
                    ))}
                </RewardWrapper>
              </Box>

              <Box>
                <Button
                  variant="primary"
                  onClick={
                    cheftType === ChefType.PANGO_CHEF && !confirmRemove ? () => setConfirmRemove(true) : onWithdraw
                  }
                >
                  {error ?? t('earn.withdrawAndClaim')}
                </Button>
              </Box>
            </>
          ) : (
            <Box display="grid" height="100%">
              <Box
                bgColor="color3"
                borderRadius="8px"
                padding="15px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <Text color="text1" textAlign="center">
                  {t(chefType === ChefType.PANGO_CHEF ? 'pangoChef.removeWarning' : 'earn.removeWarning')}
                </Text>
              </Box>
              <Buttons chefType={chefType}>
                {chefType === ChefType.PANGO_CHEF && (
                  <Button variant="outline" onClick={redirectToCompound}>
                    <Text color="text1">
                      <Text color="text1">{t('sarCompound.compound')}</Text>
                    </Text>
                  </Button>
                )}
                <Button variant="primary" onClick={onWithdraw}>
                  {error ?? t('earn.withdrawAndClaim')}
                </Button>
              </Buttons>
            </Box>
          )}
        </Root>
      )}

      {attempting && !hash && <Loader size={100} label="Withdrawing & Claiming..." />}

      {hash && (
        <TransactionCompleted
          onClose={wrappedOnDismiss}
          submitText={t('pool.successWithdraw')}
          isShowButtton={true}
          onButtonClick={() => setShowRemoveLiquidityDrawer(true)}
          buttonText={t('navigationTabs.removeLiquidity')}
        />
      )}

      {isRemoveLiquidityDrawerVisible && (
        <RemoveLiquidityDrawer
          isOpen={isRemoveLiquidityDrawerVisible}
          onClose={() => {
            setShowRemoveLiquidityDrawer(false);
            wrappedOnDismiss();
          }}
          clickedLpTokens={[token0, token1]}
        />
      )}
    </FarmRemoveWrapper>
  );
};
export default RemoveFarm;
