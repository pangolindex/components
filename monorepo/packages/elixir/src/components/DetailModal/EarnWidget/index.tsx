import { Box, Button, Loader, Stat, Text, Tooltip, TransactionCompleted } from '@honeycomb/core';
import {
  MixPanelEvents,
  unwrappedToken,
  useChainId,
  useLibrary,
  useMixpanel,
  usePangolinWeb3,
  useTranslation,
} from '@honeycomb/shared';
import { Token } from '@pangolindex/sdk';
import React, { useContext, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { useConcLiqPositionFeesHook } from 'src/hooks';
import { usePool } from 'src/hooks/common';
import { useElixirCollectEarnedFeesHook } from 'src/state/wallet/hooks';
import RemoveDrawer from './RemoveDrawer';
import { ClaimWrapper, ErrorBox, ErrorWrapper, RewardWrapper, Root, StatWrapper } from './styles';
import { EarnWidgetProps } from './types';

const EarnWidget: React.FC<EarnWidgetProps> = (props) => {
  const { position } = props;
  const { t } = useTranslation();
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const { provider, library } = useLibrary();
  const useConcLiqPositionFees = useConcLiqPositionFeesHook[chainId];
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  }

  const mixpanel = useMixpanel();

  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);
  const theme = useContext(ThemeContext);

  const [, pool] = usePool(position?.token0 ?? undefined, position?.token1 ?? undefined, position?.fee);
  // inverted is default false. We need to change it when we decide to show an inverted price
  // (inverted mean is; show everything(min, max, current price etc.) in base Token0/Token1 not Token1/Token0)
  const inverted = false;
  // fees
  const [feeValue0, feeValue1] = useConcLiqPositionFees(pool ?? undefined, position?.tokenId);
  const feeValueUpper = inverted ? feeValue0 : feeValue1;
  const feeValueLower = inverted ? feeValue1 : feeValue0;

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  const currency0ForFeeCollectionPurposes = pool ? (unwrappedToken(pool.token0, chainId) as Token) : undefined;
  const currency1ForFeeCollectionPurposes = pool ? (unwrappedToken(pool.token1, chainId) as Token) : undefined;
  const canClaim = (feeValue0?.greaterThan?.('0') ?? false) || (feeValue1?.greaterThan?.('0') ?? false);

  const collectFees = useElixirCollectEarnedFeesHook[chainId]();
  const onClaim = async () => {
    if (!chainId || !library || !account || !provider) return;
    if (!currency0ForFeeCollectionPurposes || !currency1ForFeeCollectionPurposes) return;
    try {
      setAttempting(true);
      const collectFeesResponse = await collectFees({
        tokenId: position?.tokenId,
        tokens: {
          token0: currency0ForFeeCollectionPurposes,
          token1: currency1ForFeeCollectionPurposes,
        },
        feeValues: {
          feeValue0: feeValue0,
          feeValue1: feeValue1,
        },
      });

      setHash(collectFeesResponse?.hash as string);
      if (collectFeesResponse?.hash) {
        mixpanel.track(MixPanelEvents.CLAIM_REWARDS, {
          chainId: chainId,
          token0: currency0ForFeeCollectionPurposes.symbol,
          token1: currency1ForFeeCollectionPurposes.symbol,
          tokenId: position?.tokenId,
        });
      }
    } catch (err) {
      const _err = typeof err === 'string' ? new Error(err) : (err as any);
      setError(_err?.message);
      console.error(_err);
    } finally {
      setAttempting(false);
    }
  };

  return (
    <ClaimWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text
          color="text1"
          fontSize={[22, 18]}
          fontWeight={500}
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {t('common.earned')}
        </Text>

        <Button variant="primary" width="100px" height="30px" onClick={() => setShowRemoveDrawer(true)}>
          {t('common.remove')}
        </Button>
      </Box>

      {error && (
        <ErrorWrapper>
          <ErrorBox paddingY={'20px'}>
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
              {error}
            </Text>
          </ErrorBox>
          <Button variant="primary" onClick={wrappedOnDismiss}>
            {t('transactionConfirmation.dismiss')}
          </Button>
        </ErrorWrapper>
      )}

      {!attempting && !hash && !error && (
        <Root>
          <Box mt={'6px'} flex="1" display="flex" flexDirection="column" justifyContent="center">
            <RewardWrapper>
              {feeValueUpper && currency0ForFeeCollectionPurposes && (
                <Tooltip id="unclaimedReward-1" effect="solid" backgroundColor={theme.primary}>
                  <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
                    {feeValueUpper?.toSignificant(8)}
                  </Text>
                </Tooltip>
              )}
              <StatWrapper data-tip data-for="unclaimedReward-1">
                <Stat
                  title={t('earn.unclaimedReward', { symbol: `${currency0ForFeeCollectionPurposes?.symbol}` })}
                  stat={feeValueUpper ? feeValueUpper?.toFixed(2) : '-'}
                  titlePosition="top"
                  titleFontSize={12}
                  statFontSize={[24, 18]}
                  titleColor="text1"
                  statAlign="center"
                />
              </StatWrapper>
              {feeValueLower && currency1ForFeeCollectionPurposes && (
                <Tooltip id="unclaimedReward-2" effect="solid" backgroundColor={theme.primary}>
                  <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
                    {feeValueLower?.toSignificant(8)}
                  </Text>
                </Tooltip>
              )}
              <StatWrapper data-tip data-for="unclaimedReward-2">
                <Stat
                  title={t('earn.unclaimedReward', { symbol: `${currency1ForFeeCollectionPurposes?.symbol}` })}
                  stat={feeValueLower ? feeValueLower?.toFixed(2) : '-'}
                  titlePosition="top"
                  titleFontSize={12}
                  statFontSize={[24, 18]}
                  titleColor="text1"
                  statAlign="center"
                />
              </StatWrapper>
            </RewardWrapper>

            <Box borderRadius={'8px'} bgColor="color3" mt={'12px'}>
              <Text p={'12px'} fontSize="13px" color="text1" textAlign="center">
                {t('earn.liquidityRemainsPool')}
              </Text>
            </Box>
          </Box>

          <Box my={'12px'}>
            <Button variant="primary" isDisabled={!canClaim} onClick={onClaim}>
              {t('earn.claimReward', { symbol: '' })}
            </Button>
          </Box>
        </Root>
      )}

      <RemoveDrawer
        isOpen={isRemoveDrawerVisible}
        position={position}
        onClose={() => {
          setShowRemoveDrawer(false);
        }}
      />

      {attempting && !hash && <Loader size={100} label={` ${t('sarClaim.claiming')}...`} />}

      {hash && (
        <TransactionCompleted
          buttonText={t('common.close')}
          isShowButtton={true}
          onButtonClick={wrappedOnDismiss}
          submitText={t('earn.rewardClaimed')}
        />
      )}
    </ClaimWrapper>
  );
};

export default EarnWidget;
