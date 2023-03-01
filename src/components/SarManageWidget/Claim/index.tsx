import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { useDerivativeSarClaimHook } from 'src/state/psarstake/multiChainsHooks';
import { Position } from 'src/state/psarstake/types';
import RewardsInfo from '../Compound/RewardsInfo';
import ConfirmDrawer from '../ConfirmDrawer';
import { Options } from '../types';
import { Buttons, Root } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
  onSelectPosition: (position: Position | null) => void;
}

export default function Claim({ selectedOption, selectedPosition, onChange, onSelectPosition }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();

  const useDerivativeSarClaim = useDerivativeSarClaimHook[chainId];
  const { attempting, hash, claimError, wrappedOnDismiss, onClaim } = useDerivativeSarClaim(selectedPosition);

  const png = PNG[chainId];

  const { t } = useTranslation();

  const apr = selectedPosition?.apr;

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    if (hash) {
      onSelectPosition(null);
    }
    wrappedOnDismiss();
  }, [hash, onSelectPosition]);

  const handleConfirm = useCallback(() => {
    onClaim();
  }, [onClaim]);

  useEffect(() => {
    if (openDrawer && !attempting && !hash && !claimError) {
      handleConfirmDismiss();
    }
    if (!openDrawer && attempting) {
      setOpenDrawer(true);
    }
  }, [attempting]);

  // if changed the position and the drawer is open, close
  useEffect(() => {
    if (openDrawer) setOpenDrawer(false);
  }, [selectedPosition]);

  const pendingRewards = selectedPosition?.pendingRewards ?? BigNumber.from('0');

  const renderButton = () => {
    let error: string | undefined;
    if (!selectedPosition) {
      error = t('sarStakeMore.choosePosition');
    } else if (pendingRewards.isZero()) {
      error = t('sarClaim.noRewards');
    }
    return (
      <Buttons>
        <Button variant="primary" onClick={() => onChange(Options.COMPOUND)}>
          {t('sarCompound.compound')}
        </Button>
        <Button variant="primary" onClick={handleConfirm} isDisabled={!!error}>
          {error ?? t('sarClaim.claim')}
        </Button>
      </Buttons>
    );
  };

  return (
    <Box>
      <Root>
        <RewardsInfo
          selectedOption={selectedOption}
          onChange={onChange}
          pendingRewards={formatUnits(pendingRewards, png.decimals)}
          selectedPosition={selectedPosition}
        />
        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">{t('sarUnstake.currentAPR')}</Text>
              <Text color="text1">{(apr ?? '-').toString()}%</Text>
            </Box>
            <Box>
              <Text color="text2">{t('sarClaim.aprAfter')}</Text>
              <Text color="text1">0%</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            {t('sarClaim.claimWarning')}
          </Text>
        </Box>
        {renderButton()}
      </Root>

      <ConfirmDrawer
        isOpen={openDrawer && !!selectedPosition}
        onClose={handleConfirmDismiss}
        attemptingTxn={attempting}
        txHash={hash}
        errorMessage={claimError}
        pendingMessage={t('sarClaim.pending')}
        successMessage={t('sarClaim.successSubmit')}
        confirmContent={null}
      />
    </Box>
  );
}
