import { TransactionResponse } from '@ethersproject/providers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { FARM_TYPE } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useStakingContract } from 'src/hooks/useContract';
import { useGetEarnedAmount, useMinichefPendingRewards, useMinichefPools } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { waitForTransaction } from 'src/utils';
import { ClaimWrapper, RewardWrapper, Root, StatWrapper } from './styleds';

export interface ClaimProps {
  stakingInfo: StakingInfo;
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

  const { rewardTokensAmount } = useMinichefPendingRewards(stakingInfo);

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
        mixpanel.track(MixPanelEvents.CLAIM_REWARDS, {
          chainId: chainId,
          tokenA: tokenA?.symbol,
          tokenb: tokenB?.symbol,
          tokenA_Address: tokenA?.symbol,
          tokenB_Address: tokenB?.symbol,
          pid: stakingInfo.pid,
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

  const { earnedAmount } = useGetEarnedAmount(stakingInfo?.pid as string);

  const newEarnedAmount = version < 2 ? stakingInfo?.earnedAmount : earnedAmount;

  return (
    <ClaimWrapper>
      {!attempting && !hash && (
        <Root>
          <Box flex="1" display="flex" flexDirection="column" justifyContent="center">
            <RewardWrapper isSuperFarm={isSuperFarm}>
              <StatWrapper>
                <Stat
                  title={t('earn.unclaimedReward', { symbol: 'PNG' })}
                  stat={newEarnedAmount?.toSignificant(4)}
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

      {attempting && !hash && <Loader size={100} label=" Claiming..." />}

      {hash && <TransactionCompleted onClose={wrappedOnDismiss} submitText="Your rewards claimed" />}
    </ClaimWrapper>
  );
};
export default ClaimReward;
