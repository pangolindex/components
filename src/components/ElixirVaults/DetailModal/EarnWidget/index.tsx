// import mixpanel from 'mixpanel-browser';
import React, { useContext, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Stat, Text, Tooltip, TransactionCompleted } from 'src/components';
import { PNG } from 'src/constants/tokens';
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
// import { MixPanelEvents } from 'src/hooks/mixpanel';
import RemoveDrawer from './RemoveDrawer';
import { ClaimWrapper, ErrorBox, ErrorWrapper, RewardWrapper, Root, StatWrapper } from './styles';
import { EarnWidgetProps } from './types';

const EarnWidget: React.FC<EarnWidgetProps> = (props) => {
  const { vault } = props;
  const { t } = useTranslation();
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const { provider, library } = useLibrary();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  }

  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);
  const theme = useContext(ThemeContext);

  // TODO:
  const feeValue = 13;
  const rewardToken = PNG[chainId];
  const canClaim = feeValue > 0 ?? false;

  const onClaim = async () => {
    if (!chainId || !library || !account || !provider) return;
    if (!rewardToken) return;
    try {
      setAttempting(true);
      //TODO: Send collectFees dynamic method request.

      // setHash(collectFeesResponse?.hash as string);
      // if (collectFeesResponse?.hash) {
      //   mixpanel.track(MixPanelEvents.CLAIM_REWARDS, {
      //     chainId: chainId,
      //     token0: rewardToken.symbol,
      //     vaultAddress: vault?.address,
      //   });
      // }
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
              {feeValue && rewardToken && (
                <Tooltip id="unclaimedReward-1" effect="solid" backgroundColor={theme.primary}>
                  <Text color="eerieBlack" fontSize="12px" fontWeight={500} textAlign="center">
                    {feeValue}
                  </Text>
                </Tooltip>
              )}
              <StatWrapper data-tip data-for="unclaimedReward-1">
                <Stat
                  title={t('earn.unclaimedReward', { symbol: `${rewardToken?.symbol}` })}
                  stat={feeValue > 0 ? feeValue : '-'}
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
        vault={vault}
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
