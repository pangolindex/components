/* eslint-disable max-lines */
import { parseUnits } from '@ethersproject/units';
import { JSBI, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, DoubleCurrencyLogo, NumberOptions, Stat, Text, TextInput, Tooltip } from 'src/components';
import { BIG_INT_ZERO, FARM_TYPE } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { usePair } from 'src/data/Reserves';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { useApproveCallbackHook } from 'src/hooks/useApproveCallback';
import { ApprovalState } from 'src/hooks/useApproveCallback/constant';
import { usePangoChefContract } from 'src/hooks/useContract';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import { usePangoChefStakeCallbackHook } from 'src/state/ppangoChef/hooks';
import { useHederaPangochefContractCreateCallback } from 'src/state/ppangoChef/hooks/hedera';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { useDerivedStakeInfo, useExtraPendingRewards, useGetPoolDollerWorth } from 'src/state/pstake/hooks/common';
import { SpaceType } from 'src/state/pstake/types';
import { usePairBalanceHook } from 'src/state/pwallet/hooks';
import { unwrappedToken, wrappedCurrencyAmount } from 'src/utils/wrappedCurrency';
import ConfirmDrawer from './ConfirmDrawer';
import {
  Buttons,
  CardContentBox,
  ContentBox,
  DataBox,
  ExtraRewardDataBox,
  InputWrapper,
  PoolSelectWrapper,
  StakeWrapper,
} from './styleds';

interface StakeProps {
  onComplete?: () => void;
  type: SpaceType.card | SpaceType.detail;
  stakingInfo: PangoChefInfo;
  combinedApr?: number;
}

const Stake = ({ onComplete, type, stakingInfo, combinedApr }: StakeProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const theme = useContext(ThemeContext);
  const useApproveCallback = useApproveCallbackHook[chainId];
  const usePairBalance = usePairBalanceHook[chainId];
  const useStakeCallback = usePangoChefStakeCallbackHook[chainId];
  const [shouldCreateStorage, create] = useHederaPangochefContractCreateCallback();
  const token0 = stakingInfo.tokens?.[0];
  const token1 = stakingInfo.tokens?.[1];

  const [, stakingTokenPair] = usePair(token0, token1);

  const userLiquidityUnstaked = usePairBalance(account ?? undefined, stakingTokenPair ?? undefined);

  const { liquidityInUSD } = useGetPoolDollerWorth(stakingTokenPair);

  // track and parse user input
  const [typedValue, setTypedValue] = useState((userLiquidityUnstaked as TokenAmount)?.toExact() || '');

  const { parsedAmount, error } = useDerivedStakeInfo(
    typedValue,
    stakingInfo?.stakedAmount?.token,
    userLiquidityUnstaked,
  );
  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId);

  let hypotheticalWeeklyRewardRate: TokenAmount = new TokenAmount(stakingInfo?.rewardRatePerWeek?.token, '0');
  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalWeeklyRewardRate = stakingInfo?.getHypotheticalWeeklyRewardRate(
      stakingInfo?.stakedAmount.add(parsedAmountWrapped),
      stakingInfo?.totalStakedAmount.add(parsedAmountWrapped),
      stakingInfo?.totalRewardRatePerSecond,
    );
  }

  const { rewardTokensAmount, rewardTokensMultiplier } = useExtraPendingRewards(stakingInfo);

  const isSuperFarm = (rewardTokensAmount || [])?.length > 0;

  // state for pending and submitted txn views
  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();
  const [stakeError, setStakeError] = useState<string | undefined>();

  const [openDrawer, setOpenDrawer] = useState(false);

  // pair contract for this token to be staked
  const dummyPair = new Pair(
    new TokenAmount(stakingInfo.tokens[0], '0'),
    new TokenAmount(stakingInfo.tokens[1], '0'),
    chainId,
  );
  const pairContract = usePairContract(dummyPair.liquidityToken.address);

  // approval data for stake
  const deadline = useTransactionDeadline();
  const { t } = useTranslation();

  const [stepIndex, setStepIndex] = useState(4);
  const [approval, approveCallback] = useApproveCallback(chainId, parsedAmount, stakingInfo?.stakingRewardAddress);

  const { callback: stakeCallback, error: stakeCallbackError } = useStakeCallback(
    stakingInfo.pid,
    parsedAmount?.raw?.toString() ?? undefined,
  );

  const pangochefContract = usePangoChefContract();
  const currency0 = unwrappedToken(stakingTokenPair?.token0 as Token, chainId);
  const currency1 = unwrappedToken(stakingTokenPair?.token1 as Token, chainId);

  const mixpanel = useMixpanel();

  const onChangePercentage = (value: number) => {
    if (!userLiquidityUnstaked) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue((userLiquidityUnstaked as TokenAmount).toExact());
    } else {
      const lpToken = userLiquidityUnstaked.token;
      const newAmount = userLiquidityUnstaked.multiply(JSBI.BigInt(value)).divide(JSBI.BigInt(100)) as TokenAmount;
      setTypedValue(newAmount?.toFixed(lpToken.decimals));
    }
  };

  async function onStake() {
    if (pangochefContract && parsedAmount && deadline) {
      setAttempting(true);
      if (approval === ApprovalState.APPROVED && stakeCallback) {
        try {
          const hash = await stakeCallback();
          setHash(hash);

          mixpanel.track(MixPanelEvents.ADD_FARM, {
            chainId: chainId,
            tokenA: token0.symbol,
            tokenB: token1.symbol,
            tokenA_Address: token0.address,
            tokenB_Address: token1.address,
            farmType: FARM_TYPE[3]?.toLowerCase(),
            pid: stakingInfo?.pid ?? '-1',
          });
        } catch (err) {
          const _err = err as any;
          // we only care if the error is something _other_ than the user rejected the tx
          if (_err?.code !== 4001) {
            setStakeError(_err?.message);
            console.error(_err);
          }
        } finally {
          setAttempting(false);
        }
      } else {
        setAttempting(false);
        throw new Error(t('earn.attemptingToStakeError'));
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
    const percentage = Math.ceil(
      Number(
        userLiquidityUnstaked && _typedValue
          ? JSBI.divide(
              JSBI.multiply(
                JSBI.BigInt(parseUnits(_typedValue, userLiquidityUnstaked.currency.decimals)),
                JSBI.BigInt(100),
              ),
              userLiquidityUnstaked.raw,
            ).toString()
          : 0,
      ),
    );

    setStepIndex(percentage > 100 ? 4 : Math.round(percentage / 25));
  }, []);

  async function onAttemptToApprove() {
    if (!pairContract) throw new Error(t('earn.missingDependencies'));

    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('earn.missingLiquidityAmount'));

    approveCallback();
  }

  const renderPoolDataRow = (label: string, value: string) => {
    return (
      <DataBox key={label}>
        <Text color="text4" fontSize={16}>
          {label}
        </Text>

        <Text color="text4" fontSize={16}>
          {value}
        </Text>
      </DataBox>
    );
  };

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (hash) {
      setTypedValue('');
      setStepIndex(0);
    }
    setHash('');
    setStakeError(undefined);
    setAttempting(false);
    setOpenDrawer(false);
    onComplete && onComplete();
  }, [setTypedValue, hash, onComplete]);

  useEffect(() => {
    if (userLiquidityUnstaked) {
      setTypedValue(userLiquidityUnstaked?.toExact());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLiquidityUnstaked?.toExact()]);

  useEffect(() => {
    if (openDrawer && !attempting && !hash && !stakeError) {
      handleDismissConfirmation();
    }
    if (!openDrawer && attempting) {
      setOpenDrawer(true);
    }
  }, [attempting, hash, stakeError]);

  const onConfirm = () => {
    setOpenDrawer(true);
  };

  // userLiquidityUnstaked?.toExact() -> liquidityInUSD
  // typedValue -> ?
  const finalUsd = userLiquidityUnstaked?.greaterThan('0')
    ? (Number(typedValue) * liquidityInUSD) / Number(userLiquidityUnstaked?.toExact())
    : undefined;

  const getApr = () => {
    if (combinedApr) {
      return `${combinedApr}%`;
    } else if (stakingInfo?.combinedApr) {
      return `${stakingInfo?.combinedApr}%`;
    } else {
      return '-';
    }
  };
  const dollerWarth = finalUsd ? `$${Number(finalUsd).toFixed(2)}` : '-';

  const png = PNG[chainId];

  const balanceLabel =
    !!stakingInfo?.stakedAmount?.token && userLiquidityUnstaked
      ? t('currencyInputPanel.balance') + userLiquidityUnstaked?.toExact()
      : '-';

  const renderButton = () => {
    if (shouldCreateStorage && !error) {
      return (
        <>
          <Tooltip id="storageContract" effect="solid" backgroundColor={theme.primary}>
            <Box maxWidth="250px">
              <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
                {t('pool.createStorageContract')}
              </Text>
            </Box>
          </Tooltip>
          <Buttons>
            <Button variant="primary" onClick={create} height="45px" data-tip data-for="storageContract">
              {t('pangoChef.createStorageContract')}
            </Button>
          </Buttons>
        </>
      );
    } else {
      return (
        <Buttons>
          <Button
            variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
            onClick={onAttemptToApprove}
            isDisabled={
              approval !== ApprovalState.NOT_APPROVED ||
              (JSBI.equal(stakingInfo.multiplier, BIG_INT_ZERO) &&
                stakingInfo.extraPendingRewards.length > 0 &&
                stakingInfo.extraPendingRewards.some((pendigRewards) => JSBI.equal(pendigRewards, BIG_INT_ZERO)))
            }
            loading={approval === ApprovalState.PENDING}
            loadingText={t('migratePage.loading')}
          >
            {t('earn.approve')}
          </Button>

          <Button
            variant="primary"
            isDisabled={
              !!error ||
              approval !== ApprovalState.APPROVED ||
              !!stakeCallbackError ||
              shouldCreateStorage ||
              (JSBI.equal(stakingInfo.multiplier, BIG_INT_ZERO) &&
                stakingInfo.extraPendingRewards.length > 0 &&
                stakingInfo.extraPendingRewards.some((pendigRewards) => JSBI.equal(pendigRewards, BIG_INT_ZERO)))
            }
            onClick={onConfirm}
            loading={attempting && !hash}
            loadingText={t('migratePage.loading')}
          >
            {error ?? t('earn.deposit')}
          </Button>
        </Buttons>
      );
    }
  };

  return (
    <StakeWrapper>
      {!attempting && !hash && (
        <>
          <Box flex={1}>
            {type === SpaceType.detail && (
              <PoolSelectWrapper>
                <Box display="flex" alignItems="center">
                  <DoubleCurrencyLogo size={24} currency0={currency0} currency1={currency1} />
                  <Text color="text2" fontSize={16} fontWeight={500} lineHeight="40px" marginLeft={10}>
                    {currency0?.symbol}/{currency1?.symbol}
                  </Text>
                </Box>
              </PoolSelectWrapper>
            )}

            <InputWrapper type={type}>
              <TextInput
                value={typedValue}
                addonAfter={
                  <Box display="flex" alignItems="center">
                    <Text color="text4" fontSize={[24, 18]}>
                      PGL
                    </Text>
                  </Box>
                }
                onChange={(value: any) => {
                  onUserInput(value);
                }}
                fontSize={24}
                isNumeric={true}
                placeholder="0.00"
                addonLabel={
                  account &&
                  type === SpaceType.detail && (
                    <Text color="text2" fontWeight={500} fontSize={14}>
                      {balanceLabel}
                    </Text>
                  )
                }
                label={type === SpaceType.card ? balanceLabel : undefined}
                disabled={userLiquidityUnstaked?.equalTo('0')}
              />

              <Box mt={type === 'card' ? '25px' : '0px'}>
                <NumberOptions
                  onChange={(value) => {
                    setStepIndex(type === 'card' ? value / 25 : value);
                    onChangePercentage(type === 'card' ? value : value * 25);
                  }}
                  currentValue={type === 'card' ? stepIndex * 25 : stepIndex}
                  variant={type === 'card' ? 'box' : 'step'}
                  isPercentage={true}
                  isDisabled={userLiquidityUnstaked?.equalTo('0') ?? true}
                />
              </Box>
            </InputWrapper>
            {type === 'card' && (
              <CardContentBox isSuperFarm={isSuperFarm}>
                <Stat
                  title={t('migratePage.dollarWorth')}
                  stat={dollerWarth}
                  titlePosition="top"
                  titleFontSize={14}
                  statFontSize={16}
                  titleColor="text4"
                />

                {!isSuperFarm && (
                  <Stat
                    title={t('dashboardPage.earned_weeklyIncome')}
                    stat={`${hypotheticalWeeklyRewardRate.toSignificant(4, { groupSeparator: ',' })} ${png.symbol}`}
                    titlePosition="top"
                    titleFontSize={14}
                    statFontSize={16}
                    titleColor="text4"
                  />
                )}

                <Stat
                  title={`APR`}
                  stat={getApr()}
                  titlePosition="top"
                  titleFontSize={14}
                  statFontSize={16}
                  titleColor="text4"
                />
              </CardContentBox>
            )}

            {type === SpaceType.detail && (
              <Box>
                <ContentBox>
                  {renderPoolDataRow(t('migratePage.dollarWorth'), `${dollerWarth}`)}
                  {renderPoolDataRow(
                    `${t('dashboardPage.earned_weeklyIncome')}`,
                    `${hypotheticalWeeklyRewardRate.toSignificant(4, { groupSeparator: ',' })} ${png.symbol}`,
                  )}

                  {isSuperFarm && (
                    <ExtraRewardDataBox key="extra-reward">
                      <Text color="text4" fontSize={16}>
                        {t('earn.extraReward')}
                      </Text>

                      <Box textAlign="right">
                        {rewardTokensAmount?.map((reward, index) => {
                          const tokenMultiplier = rewardTokensMultiplier?.[index];
                          const extraTokenWeeklyRewardRate = stakingInfo?.getExtraTokensWeeklyRewardRate?.(
                            hypotheticalWeeklyRewardRate,
                            reward?.token,
                            tokenMultiplier,
                          );
                          if (extraTokenWeeklyRewardRate) {
                            return (
                              <Text color="text4" fontSize={16} key={index}>
                                {extraTokenWeeklyRewardRate.toSignificant(4, { groupSeparator: ',' })}{' '}
                                {reward?.token?.symbol}
                              </Text>
                            );
                          }
                          return null;
                        })}
                      </Box>
                    </ExtraRewardDataBox>
                  )}
                </ContentBox>
              </Box>
            )}
          </Box>

          {renderButton()}
        </>
      )}

      <ConfirmDrawer
        isOpen={openDrawer}
        onClose={handleDismissConfirmation}
        attemptingTxn={attempting}
        errorMessage={stakeError}
        txHash={hash}
        type={type}
        onStake={onStake}
        tokens={[currency0, currency1]}
        amount={parsedAmount}
        dollarValue={dollerWarth}
        apr={'0%'}
      />
    </StakeWrapper>
  );
};
export default Stake;
/* eslint-enable max-lines */
