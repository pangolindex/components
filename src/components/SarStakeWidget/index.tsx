import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import CurrencyLogo from 'src/components/CurrencyLogo';
import { Stat } from 'src/components/Stat';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { ApprovalState } from 'src/hooks/useApproveCallback';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useDerivativeSarStake, useSarPositions, useSarStakeInfo } from 'src/state/psarstake/hooks';
import { useTokenBalance } from 'src/state/pwallet/hooks';
import { getBuyUrl } from 'src/utils';
import ConfirmDrawer from '../SarManageWidget/ConfirmDrawer';
import { Footer, Header, TokenRow } from '../SarManageWidget/ConfirmDrawer/styled';
import { Buttons, Root, Wrapper } from './styleds';

export default function SarManageWidget() {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();
  const { account } = usePangolinWeb3();

  const png = PNG[chainId];
  const userPngBalance = useTokenBalance(account ?? ZERO_ADDRESS, png);
  const { t } = useTranslation();

  const { apr, weeklyPNG } = useSarStakeInfo();

  const toggleWalletModal = useWalletModalToggle();

  const { positions, isLoading } = useSarPositions();

  // get fist position with balance 0
  const position = positions?.find((value) => value.balance.isZero());

  const {
    attempting,
    typedValue,
    parsedAmount,
    hash,
    dollerWorth,
    error,
    approval,
    stakeError,
    onAttemptToApprove,
    onUserInput,
    wrappedOnDismiss,
    handleMax,
    onStake,
  } = useDerivativeSarStake(position?.id);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    // if there was a tx hash, we want to clear the input
    if (hash) {
      onUserInput('');
    }
    wrappedOnDismiss();
  }, [onUserInput]);

  const desativeOverlay = () => {
    const sarOverlayElement = document.getElementById('sar-portfolio-overlay');
    if (sarOverlayElement) {
      sarOverlayElement.style.display = 'none';
    }
  };

  const showApproveFlow =
    !error &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED));

  const renderButtons = () => {
    if (!account) {
      return (
        <Button padding="15px 18px" variant="primary" onClick={toggleWalletModal}>
          {t('removeLiquidity.connectWallet')}
        </Button>
      );
    } else if (!userPngBalance?.greaterThan('0')) {
      return (
        <Button padding="15px 18px" variant="primary" as="a" href={getBuyUrl(png, chainId)} onClick={desativeOverlay}>
          {t('sarStake.buy', { symbol: png.symbol })}
        </Button>
      );
    } else {
      return (
        <Buttons>
          {showApproveFlow && (
            <Button
              variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
              isDisabled={approval !== ApprovalState.NOT_APPROVED || isLoading || !positions}
              onClick={onAttemptToApprove}
              height="46px"
            >
              {t('earn.approve')}
            </Button>
          )}
          <Button
            variant={'primary'}
            isDisabled={!!error || approval !== ApprovalState.APPROVED || isLoading || !positions}
            onClick={() => {
              setOpenDrawer(true);
              desativeOverlay();
            }}
            height="46px"
          >
            {error ?? t('sarStake.stake')}
          </Button>
        </Buttons>
      );
    }
  };

  const handleInput = useCallback(
    (value: string) => {
      onUserInput(value);
    },
    [onUserInput],
  );

  const ConfirmContent = (
    <Box width="100%" height="100%" paddingX="20px" paddingBottom="20px">
      <Header>
        <TokenRow>
          <Text fontSize={20} fontWeight={500} color="text1" style={{ marginRight: '12px' }}>
            {parsedAmount?.toSignificant(6) ?? 0}
          </Text>
          <CurrencyLogo currency={png} size={24} imageSize={48} />
        </TokenRow>
        <Box display="inline-grid" style={{ gridGap: '10px', gridTemplateColumns: '1fr 1fr' }}>
          <Stat
            title={t('sarStake.dollarValue')}
            titlePosition="top"
            titleFontSize={16}
            statFontSize={12}
            stat={`$${dollerWorth ?? 0}`}
            titleColor="text2"
          />
          <Stat
            title={t('sarStake.startingApr')}
            titlePosition="top"
            stat={'0%'}
            titleColor="text2"
            titleFontSize={16}
            statFontSize={12}
          />
        </Box>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Text color="text1">{t('sarStake.weeklyDistributed', { symbol: png.symbol })}</Text>
          <Text color="text1">{numeral(formatEther(weeklyPNG)).format('0.00a')}</Text>
        </Box>
        <Box bgColor="color3" borderRadius="8px" padding="10px">
          <Text color="text1" fontWeight={400} fontSize="12px" textAlign="center">
            {t('sarStake.confirmDescription', { symbol: png.symbol })}
          </Text>
        </Box>
      </Header>
      <Footer>
        <Box my={'10px'}>
          <Button variant="primary" onClick={onStake}>
            {t('sarStake.stake')}
          </Button>
        </Box>
      </Footer>
    </Box>
  );

  return (
    <Wrapper id="create-sar-position-widget" zIndex={100}>
      <Root padding="30px">
        <Box>
          <Box mb={18}>
            <Text color="text1" fontSize="21px" fontWeight={700}>
              {t('sarStake.createNewPosition')}
            </Text>
          </Box>
          <Box justifyContent="space-between" display="flex">
            <Text color="text1" fontSize="18px" fontWeight={500}>
              {t('sarStake.stake')}
            </Text>
            <Text color="text4">
              {t('sarStake.walletBalance', { symbol: png.symbol, balance: userPngBalance?.toFixed(2) ?? 0 })}
            </Text>
          </Box>
          <TextInput
            id="sar-stake-input"
            value={typedValue}
            placeholder="0.00"
            isNumeric={true}
            onChange={(value: any) => {
              handleInput(value);
            }}
            addonAfter={
              <Button variant="plain" backgroundColor="color2" padding="6px" height="auto" onClick={handleMax}>
                <Text color="text1">{t('sarStake.max')}</Text>
              </Button>
            }
          />
        </Box>
        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">{t('sarStake.dollarValue')}</Text>
              <Text color="text1">${dollerWorth ?? '0'}</Text>
            </Box>
            <Box>
              <Text color="text2">{t('sarStake.averageAPR')}</Text>
              <Text color="text1">{`${apr ?? '-'.toString()}%`}</Text>
            </Box>
          </Box>
        </Box>
        {renderButtons()}
      </Root>

      <ConfirmDrawer
        title={stakeError || hash || attempting ? '' : t('sarStake.summary')}
        isOpen={openDrawer}
        onClose={handleConfirmDismiss}
        attemptingTxn={attempting}
        txHash={hash}
        errorMessage={stakeError}
        pendingMessage={t('sarStake.pending', { balance: parsedAmount?.toFixed(2) ?? 0, symbol: png.symbol })}
        successMessage={t('sarStake.successSubmit')}
        confirmContent={ConfirmContent}
      />
    </Wrapper>
  );
}
