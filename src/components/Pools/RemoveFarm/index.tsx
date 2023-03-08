import { CHAINS, ChefType, Token } from '@pangolindex/sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { FARM_TYPE } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useGetHederaTokenNotAssociated, useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { usePangoChefWithdrawCallbackHook } from 'src/state/ppangoChef/multiChainsHooks';
import { useGetEarnedAmount, useGetRewardTokens, useMinichefPendingRewards } from 'src/state/pstake/hooks';
import { StakingInfo } from 'src/state/pstake/types';
import { useHederaPGLToken } from 'src/state/pwallet/hooks';
import { hederaFn } from 'src/utils/hedera';
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
  const rewardTokens = useGetRewardTokens(stakingInfo?.rewardTokens, stakingInfo?.rewardTokensAddress);
  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const chefType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  const mixpanel = useMixpanel();

  const args: [Token | undefined, Token | undefined] = useMemo(
    () =>
      hederaFn.isHederaChain(chainId) ? [stakingInfo?.tokens?.[0], stakingInfo?.tokens?.[1]] : [undefined, undefined],
    [chainId, hederaFn],
  );

  const [pglToken] = useHederaPGLToken(...args);

  // we need to check the lp token too
  // because case a user farm in non Pangolin token/Wrapped token farm and compound to this farm
  // in compoundTo
  const tokensToCheck = useMemo(() => {
    if (hederaFn.isHederaChain(chainId)) {
      return [...(rewardTokens || []), pglToken].filter((item) => !!item) as Token[];
    }
    return undefined;
  }, [rewardTokens, pglToken, hederaFn, chainId]);

  const notAssociateTokens = useGetHederaTokenNotAssociated(tokensToCheck);
  // here we get all not associated rewards tokens
  // but we associate one token at a time
  // so we get first token from array and ask user to associate
  // once user associate the token, that token will be removed from `notAssociateTokens`
  // and second token will become first and it goes on till that array gets empty
  const {
    associate: onAssociate,
    isLoading: isLoadingAssociate,
    hederaAssociated: isHederaTokenAssociated,
  } = useHederaTokenAssociated(notAssociateTokens?.[0]?.address, notAssociateTokens?.[0]?.symbol);

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

  const renderButton = () => {
    if (!isHederaTokenAssociated && notAssociateTokens?.length > 0) {
      return (
        <Button variant="primary" isDisabled={Boolean(isLoadingAssociate)} onClick={onAssociate}>
          {isLoadingAssociate
            ? `${t('pool.associating')}`
            : `${t('pool.associate')} ` + notAssociateTokens?.[0]?.symbol}
        </Button>
      );
    } else {
      return (
        <Button variant="primary" onClick={onWithdraw}>
          {error ?? t('earn.withdrawAndClaim')}
        </Button>
      );
    }
  };

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
                  <Button
                    variant="outline"
                    onClick={redirectToCompound}
                    isDisabled={Boolean(
                      stakingInfo.earnedAmount.equalTo('0') || stakingInfo.earnedAmount.lessThan('0'),
                    )}
                  >
                    <Text color="text1">
                      <Text color="text1">{t('sarCompound.compound')}</Text>
                    </Text>
                  </Button>
                )}
                {renderButton()}
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
