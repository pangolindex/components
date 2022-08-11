import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { Position, useDerivativeSarCompound } from 'src/state/psarstake/hooks';
import ConfirmDrawer from '../ConfirmDrawer';
import { Options } from '../types';
import RewardsInfo from './RewardsInfo';
import { Root } from './styleds';
interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Compound({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { attempting, hash, compoundError, wrappedOnDismiss, onCompound } = useDerivativeSarCompound(selectedPosition);

  const { t } = useTranslation();

  const oldBalance = selectedPosition?.balance;
  const newBalance = oldBalance?.add(selectedPosition?.pendingRewards ?? 0);

  // if new balance is zero return 1, if not exist position return 1 , if exist position return new balance
  const _newBalance = newBalance?.isZero() ? 1 : newBalance ?? 1;

  const apr = selectedPosition?.apr;

  // Fix to show the correct apr
  const newAPR = selectedPosition?.rewardRate.mul(86400).mul(365).mul(100).div(_newBalance);

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    wrappedOnDismiss();
  }, []);

  useEffect(() => {
    if (openDrawer && !attempting && !hash && !compoundError) {
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
    } else if (oldBalance?.isZero()) {
      error = t('sarCompound.noRewards');
    }
    return (
      <Button variant="primary" onClick={onCompound} isDisabled={!!error}>
        {error ?? t('sarCompound.compound')}
      </Button>
    );
  };

  return (
    <Box>
      <Root>
        <RewardsInfo
          selectedOption={selectedOption}
          onChange={onChange}
          pendingRewards={formatEther(pendingRewards.toString())}
          selectedPosition={selectedPosition}
        />

        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">{t('sarUnstake.currentAPR')}</Text>
              <Text color="text1">{(apr ?? '-').toString()}%</Text>
            </Box>
            <Box>
              <Text color="text2">{t('sarCompound.aprAfter')}</Text>
              <Text color="text1">{(newAPR ?? '-').toString()}%</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            {t('sarCompound.description')}
          </Text>
        </Box>
        {renderButton()}
      </Root>

      <ConfirmDrawer
        isOpen={openDrawer && !!selectedPosition}
        onClose={handleConfirmDismiss}
        attemptingTxn={attempting}
        txHash={hash}
        errorMessage={compoundError}
        pendingMessage={t('sarCompound.pending')}
        successMessage={t('sarCompound.successSubmit')}
        confirmContent={null}
      />
    </Box>
  );
}
