import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { ZERO_ADDRESS } from 'src/constants';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { ApprovalState } from 'src/hooks/useApproveCallback';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useDerivativeSarStake, useSarStakeInfo } from 'src/state/psarstake/hooks';
import { useTokenBalances } from 'src/state/pwallet/hooks';
import ConfirmDrawer from './ConfirmDrawer';
import { Buttons, Root } from './styleds';

export default function Stake() {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();
  const { account } = usePangolinWeb3();

  const png = PNG[chainId];
  const tokensBalances = useTokenBalances(account ?? '', [png]);
  const userPngBalance = tokensBalances[png.address];
  const { t } = useTranslation();

  const { APR, weeklyPNG } = useSarStakeInfo();

  const toggleWalletModal = useWalletModalToggle();

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
  } = useDerivativeSarStake();

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
      const origin = window.location.origin;
      const path = `/#/swap?inputCurrency=${ZERO_ADDRESS}&outputCurrency=${png.address}`;
      const url = origin.includes('localhost') || origin.includes('pangolin.exchange') ? path : `${origin}${path}`;

      return (
        <Button padding="15px 18px" variant="primary" as="a" href={url}>
          {t('header.buy', { symbol: png.symbol })}
        </Button>
      );
    } else {
      return (
        <Buttons>
          {showApproveFlow && (
            <Button
              variant={approval === ApprovalState.APPROVED ? 'confirm' : 'primary'}
              isDisabled={approval !== ApprovalState.NOT_APPROVED}
              onClick={onAttemptToApprove}
              height="46px"
            >
              {t('earn.approve')}
            </Button>
          )}
          <Button
            variant={'primary'}
            isDisabled={!!error || approval !== ApprovalState.APPROVED}
            onClick={() => setOpenDrawer(true)}
            height="46px"
          >
            {error ?? t('earnPage.stake')}
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

  return (
    <Box>
      <Root>
        <Box>
          <Box mb={18}>
            <Text color="text1" fontSize="21px" fontWeight={700}>
              Create a new position
            </Text>
          </Box>
          <Box justifyContent="space-between" display="flex">
            <Text color="text1" fontSize="18px" fontWeight={500}>
              Stake
            </Text>
            <Text color="text4">
              In Wallet {userPngBalance?.toSignificant(2) ?? 0} {png.symbol ?? 'PNG'}
            </Text>
          </Box>
          <TextInput
            value={typedValue}
            placeholder="0.00"
            isNumeric={true}
            onChange={(value: any) => {
              handleInput(value);
            }}
            addonAfter={
              <Button variant="plain" backgroundColor="color2" padding="10px" onClick={handleMax}>
                <Text color="text1">MAX</Text>
              </Button>
            }
          />
        </Box>
        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">Dolar Value</Text>
              <Text color="text1">{dollerWorth ?? '0'}$</Text>
            </Box>
            <Box>
              <Text color="text2">Median APR</Text>
              <Text color="text1">{`${APR ? APR.toString() : '-'}%`}</Text>
            </Box>
          </Box>
        </Box>
        {renderButtons()}
      </Root>
      {openDrawer && (
        <ConfirmDrawer
          isOpen={openDrawer}
          stakeAmount={parsedAmount}
          token={png}
          dollerWorth={dollerWorth}
          weeklyPNG={weeklyPNG}
          attemptingTxn={attempting}
          txHash={hash}
          onConfirm={onStake}
          errorMessage={stakeError}
          onClose={handleConfirmDismiss}
        />
      )}
    </Box>
  );
}
