/* eslint-disable max-lines */
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import {
  Box,
  Button,
  DoubleCurrencyLogo,
  Loader,
  NumberOptions,
  Stat,
  Text,
  TextInput,
  TransactionCompleted,
} from '@honeycomb-finance/core';
import {
  BIG_INT_ZERO,
  FARM_TYPE,
  MixPanelEvents,
  PNG,
  unwrappedToken,
  useChainId,
  useLibrary,
  useMixpanel,
  usePairContract,
  usePangolinWeb3,
  useTranslation,
  waitForTransaction,
  wrappedCurrencyAmount,
} from '@honeycomb-finance/shared';
import {
  ApprovalState,
  useApproveCallback,
  usePair,
  useTokenBalance,
  useTransactionAdder,
  useTransactionDeadline,
} from '@honeycomb-finance/state-hooks';
import { JSBI, Pair, Token, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useDerivedStakeInfo,
  useExtraPendingRewards,
  useGetPoolDollerWorth,
  useMinichefPools,
} from 'src/hooks/minichef/hooks/common';
import { DoubleSideStakingInfo, MinichefStakingInfo, SpaceType } from 'src/hooks/minichef/types';
import { useStakingContract } from 'src/hooks/useContract';
import { useGetTransactionSignature, useRefetchMinichefSubgraph } from 'src/hooks/wallet/utils';
import SelectPoolDrawer from './SelectPoolDrawer';
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
  version: number;
  onComplete?: () => void;
  type: SpaceType.card | SpaceType.detail;
  stakingInfo: DoubleSideStakingInfo;
  combinedApr?: number;
}

const Stake = ({ version, onComplete, type, stakingInfo, combinedApr }: StakeProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { library } = useLibrary();
  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const [, stakingTokenPair] = usePair(token0, token1);

  const [selectedPair, setSelectedPair] = useState<Pair | null>(stakingTokenPair);

  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, selectedPair?.liquidityToken);
  const { liquidityInUSD } = useGetPoolDollerWorth(selectedPair);

  const [isPoolDrawerOpen, setIsPoolDrawerOpen] = useState(false);

  // track and parse user input
  const [typedValue, setTypedValue] = useState((userLiquidityUnstaked as TokenAmount)?.toExact() || '');

  const getSignature = useGetTransactionSignature();

  const mixpanel = useMixpanel();

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
  const addTransaction = useTransactionAdder();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();

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
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null,
  );
  const [approval, approveCallback] = useApproveCallback(chainId, parsedAmount, stakingInfo?.stakingRewardAddress);

  const stakingContract = useStakingContract(stakingInfo?.stakingRewardAddress);
  const currency0 = unwrappedToken(selectedPair?.token0 as Token, chainId);
  const currency1 = unwrappedToken(selectedPair?.token1 as Token, chainId);
  const poolMap = useMinichefPools();
  const refetchMinichefSubgraph = useRefetchMinichefSubgraph();

  const onChangePercentage = (value: number) => {
    setSignatureData(null);
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
    if (stakingContract && poolMap && parsedAmount && deadline) {
      setAttempting(true);
      const method = version < 2 ? 'stake' : 'deposit';
      const args =
        version < 2
          ? [`0x${parsedAmount.raw.toString(16)}`]
          : [poolMap[stakingInfo?.stakedAmount.token.address], `0x${parsedAmount.raw.toString(16)}`, account];

      if (approval === ApprovalState.APPROVED) {
        try {
          const response: TransactionResponse = await stakingContract[method](...args);
          await waitForTransaction(response, 5);
          addTransaction(response, {
            summary: t('earn.depositLiquidity'),
          });
          await refetchMinichefSubgraph();
          setHash(response.hash);
        } catch (err) {
          setAttempting(false);
          const _err = err as any;
          // we only care if the error is something _other_ than the user rejected the tx
          if (_err?.code !== 4001) {
            console.error(_err);
          }
        }
      } else if (signatureData) {
        const permitMethod = version < 2 ? 'stakeWithPermit' : 'depositWithPermit';
        const permitArgs =
          version < 2
            ? [
                `0x${parsedAmount.raw.toString(16)}`,
                signatureData.deadline,
                signatureData.v,
                signatureData.r,
                signatureData.s,
              ]
            : [
                poolMap[stakingInfo.stakedAmount.token.address],
                `0x${parsedAmount.raw.toString(16)}`,
                account,
                signatureData.deadline,
                signatureData.v,
                signatureData.r,
                signatureData.s,
              ];
        try {
          const response: TransactionResponse = await stakingContract[permitMethod](...permitArgs);
          await waitForTransaction(response, 1);
          addTransaction(response, {
            summary: t('earn.depositLiquidity'),
          });
          setHash(response.hash);

          mixpanel.track(MixPanelEvents.ADD_FARM, {
            chainId: chainId,
            tokenA: token0?.symbol,
            tokenB: token1?.symbol,
            tokenA_Address: token0.address,
            tokenB_Address: token1.address,
            farmType: FARM_TYPE[version]?.toLowerCase(),
            pid: poolMap[stakingInfo.stakedAmount.token.address] ?? '-1',
          });
        } catch (err) {
          setAttempting(false);
          const _err = err as any;
          // we only care if the error is something _other_ than the user rejected the tx
          if (_err?.code !== 4001) {
            console.error(_err);
          }
        }
      } else {
        setAttempting(false);
        throw new Error(t('earn.attemptingToStakeError'));
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((_typedValue: string) => {
    setSignatureData(null);
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

  // used for max input button
  // const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  // const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  // const handleMax = useCallback(() => {
  //   maxAmountInput && onUserInput(maxAmountInput.toExact())
  // }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!pairContract || !library || !deadline) throw new Error(t('earn.missingDependencies'));

    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('earn.missingLiquidityAmount'));

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account);

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: 'Pangolin Liquidity',
      version: '1',
      chainId: chainId,
      verifyingContract: pairContract.address,
    };
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const message = {
      owner: account,
      spender: stakingInfo.stakingRewardAddress,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber(),
    };
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    try {
      const signature: any = await getSignature(data);

      setSignatureData({
        v: signature.v,
        r: signature.r,
        s: signature.s,
        deadline: deadline.toNumber(),
      });
    } catch (err: any) {
      approveCallback();
    }
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
    setSignatureData(null);
    setAttempting(false);
    onComplete && onComplete();
  }, [setTypedValue, hash, onComplete]);

  const handleSelectPoolDrawerClose = useCallback(() => {
    setIsPoolDrawerOpen(false);
  }, [setIsPoolDrawerOpen]);

  useEffect(() => {
    if (userLiquidityUnstaked) {
      setTypedValue(userLiquidityUnstaked?.toExact());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLiquidityUnstaked?.toExact()]);

  const onPoolSelect = useCallback(
    (pairSelected) => {
      setSelectedPair(pairSelected);
    },
    [setSelectedPair],
  );

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

  const balanceLabel =
    !!stakingInfo?.stakedAmount?.token && userLiquidityUnstaked
      ? t('currencyInputPanel.balance') + userLiquidityUnstaked?.toSignificant(6)
      : '-';

  const png = PNG[chainId];

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
                disabled={userLiquidityUnstaked?.equalTo('0') ?? true}
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

          <Buttons>
            <Button
              variant={approval === ApprovalState.APPROVED || signatureData !== null ? 'confirm' : 'primary'}
              onClick={onAttemptToApprove}
              isDisabled={
                approval !== ApprovalState.NOT_APPROVED ||
                signatureData !== null ||
                (JSBI.equal(stakingInfo?.multiplier, BIG_INT_ZERO) &&
                  (stakingInfo as MinichefStakingInfo)?.extraPendingRewards.length > 0 &&
                  (stakingInfo as MinichefStakingInfo)?.extraPendingRewards.some((pendigRewards) =>
                    JSBI.equal(pendigRewards, BIG_INT_ZERO),
                  ))
              }
              loading={attempting && !hash}
              loadingText={t('migratePage.loading')}
            >
              {t('earn.approve')}
            </Button>

            <Button
              variant="primary"
              isDisabled={
                !!error ||
                (signatureData === null && approval !== ApprovalState.APPROVED) ||
                (JSBI.equal(stakingInfo?.multiplier, BIG_INT_ZERO) &&
                  (stakingInfo as MinichefStakingInfo)?.extraPendingRewards.length > 0 &&
                  (stakingInfo as MinichefStakingInfo)?.extraPendingRewards.some((pendigRewards) =>
                    JSBI.equal(pendigRewards, BIG_INT_ZERO),
                  ))
              }
              onClick={onStake}
              loading={attempting && !hash}
              loadingText={t('migratePage.loading')}
            >
              {error ?? t('earn.deposit')}
            </Button>
          </Buttons>
        </>
      )}

      {attempting && !hash && <Loader size={100} label={`${t('earn.depositingLiquidity')}`} />}
      {attempting && hash && (
        <TransactionCompleted
          submitText={`${t('earn.deposited')}`}
          isShowButtton={type === 'card' ? false : true}
          onButtonClick={handleDismissConfirmation}
          buttonText="Close"
        />
      )}

      {isPoolDrawerOpen && (
        <SelectPoolDrawer
          isOpen={isPoolDrawerOpen}
          onClose={handleSelectPoolDrawerClose}
          onPoolSelect={onPoolSelect}
          selectedPair={selectedPair}
        />
      )}
    </StakeWrapper>
  );
};
export default Stake;
/* eslint-enable max-lines */
