import React, { useContext, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, Loader, Text, TransactionCompleted } from 'src/components';
import { FARM_TYPE } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import { usePangoChefContract } from 'src/hooks/useContract';
import { usePangoChefClaimRewardCallbackHook } from 'src/state/ppangoChef/multiChainsHooks';
import { PangoChefInfo } from 'src/state/ppangoChef/types';
import { Buttons, ClaimWrapper, ErrorBox, ErrorWrapper, Root } from './styleds';

export interface ClaimProps {
  stakingInfo: PangoChefInfo;
  onClose: () => void;
  redirectToCompound: () => void;
}
const ClaimRewardV3 = ({ stakingInfo, onClose, redirectToCompound }: ClaimProps) => {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const useClaimRewardCallback = usePangoChefClaimRewardCallbackHook[chainId];
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const png = PNG[chainId];

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);
  const [claimError, setClaimError] = useState<string | undefined>();

  const pangoChefContract = usePangoChefContract();

  const mixpanel = useMixpanel();

  const { callback: claimRewardCallback } = useClaimRewardCallback(stakingInfo.pid, stakingInfo.poolType);

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setClaimError(undefined);
    onClose();
  }

  async function onClaimReward() {
    if (pangoChefContract && stakingInfo?.stakedAmount && claimRewardCallback) {
      setAttempting(true);
      try {
        const hash = await claimRewardCallback();
        setHash(hash);

        const tokenA = stakingInfo.tokens[0];
        const tokenB = stakingInfo.tokens[1];
        mixpanel.track(MixPanelEvents.CLAIM_REWARDS, {
          chainId: chainId,
          tokenA: tokenA?.symbol,
          tokenb: tokenB?.symbol,
          tokenA_Address: tokenA?.symbol,
          tokenB_Address: tokenB?.symbol,
          pid: stakingInfo.pid,
          farmType: FARM_TYPE[3]?.toLowerCase(),
        });
      } catch (error) {
        const err = error as any;
        // we only care if the error is something _other_ than the user rejected the tx
        if (err?.code !== 4001) {
          setClaimError(err?.message);
          console.error(err);
        }
      } finally {
        setAttempting(false);
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

  return (
    <ClaimWrapper>
      {!attempting && !hash && !claimError && (
        <Root>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            padding="20px"
            bgColor="color3"
            borderRadius="8px"
            margin="auto"
          >
            <Text color="text1" textAlign="center">
              {t('pangoChef.claimWarning2')}
            </Text>
          </Box>

          <Buttons>
            <Button variant="outline" onClick={onClaimReward} color={theme.text10}>
              {_error ?? t('earn.claimReward', { symbol: png.symbol })}
            </Button>
            <Button variant="primary" onClick={redirectToCompound}>
              {t('sarCompound.compound')}
            </Button>
          </Buttons>
        </Root>
      )}

      {claimError && (
        <ErrorWrapper paddingX="30px" paddingBottom="30px">
          <ErrorBox>
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
              {claimError}
            </Text>
          </ErrorBox>
          <Button variant="primary" onClick={onClose}>
            {t('transactionConfirmation.dismiss')}
          </Button>
        </ErrorWrapper>
      )}

      {attempting && !hash && <Loader size={100} label={`${t('sarClaim.pending')}...`} />}

      {hash && <TransactionCompleted onClose={wrappedOnDismiss} submitText="Your rewards claimed" />}
    </ClaimWrapper>
  );
};
export default ClaimRewardV3;
