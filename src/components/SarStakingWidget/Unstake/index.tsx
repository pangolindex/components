import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { TextInput } from 'src/components/TextInput';
import { PNG } from 'src/constants/tokens';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Position, useDerivativeSarUnstake } from 'src/state/psarstake/hooks';
import Title from '../Title';
import { Options } from '../types';
import ConfirmDrawer from './ConfirmDrawer';
import { Root } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Unstake({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const png = PNG[chainId];

  const stakedAmount = selectedPosition?.amount ?? 0;

  const { t } = useTranslation();

  const {
    attempting,
    hash,
    typedValue,
    parsedAmount,
    error,
    unstakeError,
    onUserInput,
    wrappedOnDismiss,
    handleMax,
    onUnstake,
  } = useDerivativeSarUnstake(selectedPosition);

  const toggleWalletModal = useWalletModalToggle();

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    // if there was a tx hash, we want to clear the input
    if (hash) {
      onUserInput('');
    }
    wrappedOnDismiss();
  }, [onUserInput]);

  const renderButton = () => {
    if (!account) {
      return (
        <Button padding="15px 18px" variant="primary" onClick={toggleWalletModal}>
          {t('removeLiquidity.connectWallet')}
        </Button>
      );
    } else {
      return (
        <Button
          variant={'primary'}
          isDisabled={!selectedPosition || !!error}
          onClick={() => setOpenDrawer(true)}
          height="46px"
        >
          {!selectedPosition ? 'Select a Position' : error ?? t('earnPage.unstake')}
        </Button>
      );
    }
  };

  return (
    <Box>
      <Root>
        <Title selectedOption={selectedOption} onChange={onChange} />
        <Box>
          <Box justifyContent="space-between" display="flex">
            <Text color="text1" fontSize="18px" fontWeight={500}>
              Unstake
            </Text>
            <Text color="text4">
              Staked {numeral(formatEther(stakedAmount)).format('0.00a')} {png.symbol ?? 'PNG'}
            </Text>
          </Box>
          <TextInput
            value={typedValue}
            isNumeric={true}
            placeholder="0.00"
            addonAfter={
              <Button variant="plain" backgroundColor="color2" padding="10px" onClick={handleMax}>
                <Text color="text1">MAX</Text>
              </Button>
            }
            onChange={(value: any) => {
              onUserInput(value);
            }}
          />
        </Box>
        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">Current APR</Text>
              <Text color="text1">{(selectedPosition?.apr ?? '-').toString()}%</Text>
            </Box>
            <Box>
              <Text color="text2">APR After Unstake</Text>
              <Text color="text1">0%</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            When you unstake, your average APR will fall to 0%.
          </Text>
        </Box>
        {renderButton()}
      </Root>
      {openDrawer && !!selectedPosition && (
        <ConfirmDrawer
          isOpen={openDrawer}
          unstakeAmount={parsedAmount}
          token={png}
          position={selectedPosition}
          attemptingTxn={attempting}
          txHash={hash}
          onConfirm={onUnstake}
          errorMessage={unstakeError}
          onClose={handleConfirmDismiss}
        />
      )}
    </Box>
  );
}
