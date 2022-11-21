import { TransactionResponse } from '@ethersproject/providers';
import { CHAINS, ChefType } from '@pangolindex/sdk';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3, useRefetchMinichefSubgraph } from 'src/hooks';
import { usePangoChefContract, useStakingContract } from 'src/hooks/useContract';
import { useGetEarnedAmount, useMinichefPendingRewards, useMinichefPools } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { useTransactionAdder } from 'src/state/ptransactions/hooks';
import { waitForTransaction } from 'src/utils';
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
  const [isRemoveLiquidityDrawerVisible, setShowRemoveLiquidityDrawer] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { t } = useTranslation();

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  const poolMap = useMinichefPools();
  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress);
  const pangoChefContract = usePangoChefContract();

  const chainId = useChainId();
  const png = PNG[chainId];

  const contract = version <= 2 ? stakingContract : pangoChefContract;

  const { rewardTokensAmount } = useMinichefPendingRewards(stakingInfo);

  const refetchMinichefSubgraph = useRefetchMinichefSubgraph();

  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const chefType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

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
    if (!contract || (version === 2 && !poolMap)) return;
    if (stakingInfo?.stakedAmount) {
      setAttempting(true);
      const method = version === 1 ? 'exit' : version === 2 ? 'withdrawAndHarvest' : 'withdraw';
      const args =
        version === 1
          ? []
          : version === 2
          ? [
              poolMap[stakingInfo.stakedAmount.token.address],
              `0x${stakingInfo.stakedAmount?.raw.toString(16)}`,
              account,
            ]
          : [stakingInfo.pid, `0x${stakingInfo.stakedAmount?.raw.toString(16)}`];

      try {
        const response: TransactionResponse = await contract[method](...args);

        await waitForTransaction(response, 5);
        addTransaction(response, {
          summary: t('earn.withdrawDepositedLiquidity'),
        });
        await refetchMinichefSubgraph();
        setHash(response.hash);
      } catch (err) {
        setAttempting(false);
        const _err = err as any;
        // we only care if the error is something _other_ than the user rejected the tx
        if (_err?.code !== 4001) {
          console.error(err);
        }
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
