import { TransactionResponse } from '@ethersproject/providers';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from '@honeycomb-finance/core';
import {
  FARM_TYPE,
  MixPanelEvents,
  PNG,
  useChainId,
  useMixpanel,
  usePangolinWeb3,
  useTranslation,
  waitForTransaction,
} from '@honeycomb-finance/shared';
import { useTransactionAdder } from '@honeycomb-finance/state-hooks';
import React, { useState } from 'react';
import { useExtraPendingRewards, useMinichefPools } from 'src/hooks/minichef/hooks/common';
import { DoubleSideStakingInfo, MinichefStakingInfo } from 'src/hooks/minichef/types';
import { useStakingContract } from 'src/hooks/useContract';
import { ClaimWrapper, RewardWrapper, Root, StatWrapper } from './styleds';

export interface ClaimProps {
  stakingInfo: DoubleSideStakingInfo;
  version: number;
  onClose: () => void;
}
const ClaimReward = ({ stakingInfo, version, onClose }: ClaimProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  const poolMap = useMinichefPools();
  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress);

  const { rewardTokensAmount } = useExtraPendingRewards(stakingInfo);

  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const mixpanel = useMixpanel();

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    onClose();
  }

  const png = PNG[chainId];

  async function onClaimReward() {
    if (stakingContract && poolMap && stakingInfo?.stakedAmount) {
      setAttempting(true);
      const method = version < 2 ? 'getReward' : 'harvest';
      const args = version < 2 ? [] : [poolMap[stakingInfo.stakedAmount.token.address], account];

      try {
        const response: TransactionResponse = await stakingContract[method](...args);
        await waitForTransaction(response, 1);
        addTransaction(response, {
          summary: t('earn.claimAccumulated', { symbol: png.symbol }),
        });
        setHash(response.hash);
        const tokenA = stakingInfo.tokens[0];
        const tokenB = stakingInfo.tokens[1];

        // farm version 0 is old and this has no pid
        const pid = FARM_TYPE[version] !== FARM_TYPE[1] ? (stakingInfo as MinichefStakingInfo).pid : '';

        mixpanel.track(MixPanelEvents.CLAIM_REWARDS, {
          chainId: chainId,
          tokenA: tokenA?.symbol,
          tokenb: tokenB?.symbol,
          tokenA_Address: tokenA?.address,
          tokenB_Address: tokenB?.address,
          pid: pid,
          farmType: FARM_TYPE[version]?.toLowerCase(),
        });
      } catch (error) {
        setAttempting(false);
        const err = error as any;
        // we only care if the error is something _other_ than the user rejected the tx
        if (err?.code !== 4001) {
          console.error(err);
        }
      }
    }
  }

  let _error: string | undefined;
  if (!account) {
    _error = t('earn.connectWallet');
  }
  if (!stakingInfo?.stakedAmount) {
    _error = _error ?? t('earn.enterAmount');
  }

  const { earnedAmount } = stakingInfo;

  return (
    <ClaimWrapper>
      {!attempting && !hash && (
        <Root>
          <Box flex="1" display="flex" flexDirection="column" justifyContent="center">
            <RewardWrapper isSuperFarm={isSuperFarm}>
              <StatWrapper>
                <Stat
                  title={t('earn.unclaimedReward', { symbol: 'PNG' })}
                  stat={earnedAmount?.toSignificant(4)}
                  titlePosition="top"
                  titleFontSize={12}
                  statFontSize={[24, 18]}
                  titleColor="text1"
                  statAlign="center"
                />
              </StatWrapper>

              {isSuperFarm &&
                rewardTokensAmount?.map((rewardAmount, i) => (
                  <StatWrapper key={i}>
                    <Stat
                      title={t('earn.unclaimedReward', { symbol: rewardAmount?.token?.symbol })}
                      stat={rewardAmount?.toSignificant(4)}
                      titlePosition="top"
                      titleFontSize={12}
                      statFontSize={[24, 18]}
                      titleColor="text1"
                      statAlign="center"
                    />
                  </StatWrapper>
                ))}
            </RewardWrapper>

            <Text fontSize="13px" color="text2" textAlign="center">
              {t('earn.liquidityRemainsPool')}
            </Text>
          </Box>

          <Box my={'10px'}>
            <Button variant="primary" onClick={onClaimReward}>
              {_error ?? t('earn.claimReward', { symbol: 'PNG' })}
            </Button>
          </Box>
        </Root>
      )}

      {attempting && !hash && <Loader size={100} label={` ${t('sarClaim.claiming')}...`} />}

      {hash && <TransactionCompleted onClose={wrappedOnDismiss} submitText={t('earn.rewardClaimed')} />}
    </ClaimWrapper>
  );
};
export default ClaimReward;
