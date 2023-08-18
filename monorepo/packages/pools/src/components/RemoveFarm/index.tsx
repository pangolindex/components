import { CHAINS, ChefType, Token } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Loader, Stat, Text, TransactionCompleted } from 'src/components';
import { FARM_TYPE } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useGetHederaTokenNotAssociated, useHederaTokenAssociated } from 'src/hooks/tokens/hedera';
import { usePangoChefWithdrawCallbackHook } from 'src/state/ppangoChef/hooks';
import { useExtraPendingRewards, useGetRewardTokens } from 'src/state/pstake/hooks/common';
import { DoubleSideStakingInfo, MinichefStakingInfo } from 'src/state/pstake/types';
import { useHederaPGLToken } from 'src/state/pwallet/hooks/hedera';
import { Hedera } from 'src/utils/hedera';
import RemoveLiquidityDrawer from '../RemoveLiquidityDrawer';
import { Buttons, FarmRemoveWrapper, RewardWrapper, Root, StatWrapper } from './styleds';

interface RemoveFarmProps {
  stakingInfo: DoubleSideStakingInfo;
  version: number;
  onClose: () => void;
  // this prop will be used if user move away from first step
  onLoading?: (value: boolean) => void;
  // percetage is the percetage removed
  onComplete?: (percetage: number) => void;
  redirectToCompound?: () => void;
}
const RemoveFarm = ({ stakingInfo, version, onClose, onLoading, onComplete, redirectToCompound }: RemoveFarmProps) => {
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

  const chefType = CHAINS[chainId].contracts?.mini_chef?.type ?? ChefType.MINI_CHEF_V2;

  const { rewardTokensAmount } = useExtraPendingRewards(stakingInfo);
  const rewardTokens = useGetRewardTokens(stakingInfo);
  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  const mixpanel = useMixpanel();

  const args: [Token | undefined, Token | undefined] = useMemo(
    () =>
      Hedera.isHederaChain(chainId) ? [stakingInfo?.tokens?.[0], stakingInfo?.tokens?.[1]] : [undefined, undefined],
    [chainId],
  );

  const [pglToken] = useHederaPGLToken(...args);

  // we need to check the lp token too
  // because case a user farm in non Pangolin token/Wrapped token farm and compound to this farm
  // in compoundTo
  const tokensToCheck = useMemo(() => {
    // add png in first position
    const filteredTokens = (rewardTokens || []).filter((token) => !!token && !token.equals(png));
    const _rewardTokens = [png, ...filteredTokens];

    if (Hedera.isHederaChain(chainId)) {
      return [...(_rewardTokens || []), pglToken].filter((item) => !!item) as Token[];
    }
    return undefined;
  }, [rewardTokens, pglToken, chainId]);

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

  const stakedAmount = stakingInfo?.stakedAmount;

  const { callback: withdrawCallback, error: withdrawCallbackError } = useWithdrawCallback({
    version,
    poolId: chefType === ChefType.MINI_CHEF ? undefined : (stakingInfo as MinichefStakingInfo)?.pid,
    stakedAmount: stakedAmount,
    stakingRewardAddress: stakingInfo?.stakingRewardAddress,
  });

  useEffect(() => {
    if (onLoading) {
      onLoading(attempting);
    }
  }, [attempting]);

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    onClose();
  }

  async function onWithdraw() {
    if (stakedAmount && withdrawCallback) {
      setAttempting(true);

      try {
        const hash = await withdrawCallback();
        setHash(hash);

        if (onComplete) {
          onComplete(100);
        }

        mixpanel.track(MixPanelEvents.REMOVE_FARM, {
          chainId: chainId,
          tokenA: token0.symbol,
          tokenB: token1.symbol,
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

  const { earnedAmount } = stakingInfo;

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

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
                        stat={numeral(
                          stakedAmount?.toFixed(
                            stakedAmount?.greaterThan('0') && stakedAmount?.token?.decimals > 1 ? 2 : undefined,
                          ),
                        ).format('0.00a')}
                        titlePosition="top"
                        titleFontSize={12}
                        statFontSize={[20, 18]}
                        titleColor="text1"
                        statAlign="center"
                        toolTipText={stakedAmount?.toExact()}
                      />
                    </StatWrapper>
                  )}
                  {earnedAmount && (
                    <StatWrapper>
                      <Stat
                        title={t('earn.unclaimedReward', { symbol: png.symbol })}
                        stat={numeral(
                          earnedAmount?.toFixed(
                            earnedAmount?.greaterThan('0') && earnedAmount?.token?.decimals > 1 ? 2 : undefined,
                          ),
                        ).format('0.00a')}
                        titlePosition="top"
                        titleFontSize={12}
                        statFontSize={[20, 18]}
                        titleColor="text1"
                        statAlign="center"
                        toolTipText={earnedAmount?.toExact()}
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
                    chefType === ChefType.PANGO_CHEF && !confirmRemove ? () => setConfirmRemove(true) : onWithdraw
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
                    color={stakingInfo.earnedAmount.greaterThan('0') ? 'text1' : undefined}
                  >
                    {t('sarCompound.compound')}
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
