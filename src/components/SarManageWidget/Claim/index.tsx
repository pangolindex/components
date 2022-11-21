import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { Position, useDerivativeSarClaim } from 'src/state/psarstake/hooks';
import RewardsInfo from '../Compound/RewardsInfo';
import ConfirmDrawer from '../ConfirmDrawer';
import { Options } from '../types';
import { Buttons, Root } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Claim({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { attempting, hash, claimError, wrappedOnDismiss, onClaim } = useDerivativeSarClaim(selectedPosition);

  const { t } = useTranslation();

  const apr = selectedPosition?.apr;

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    wrappedOnDismiss();
  }, []);

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
          pendingRewards={formatEther(pendingRewards)}
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
            Due to the nature of SAR staking system claiming your rewards will drop your APR to 0. You can instead
            compound your rewards without losing your APR.
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
