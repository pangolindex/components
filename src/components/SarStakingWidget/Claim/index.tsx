import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { Position, useDerivativeSarClaim } from 'src/state/psarstake/hooks';
import ConfirmDrawer from '../ConfirmDrawer';
import Title from '../Title';
import { Options } from '../types';
import { Root, ToolTipText } from './styleds';

interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Claim({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();

  const { attempting, hash, claimError, wrappedOnDismiss, onClaim } = useDerivativeSarClaim(selectedPosition);

  const { t } = useTranslation();

  const apr = selectedPosition?.apr;
  const png = PNG[chainId];

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    wrappedOnDismiss();
  }, []);

  const handleConfirm = useCallback(() => {
    setOpenDrawer(true);
    onClaim();
  }, [onClaim]);

  useEffect(() => {
    if (!attempting && openDrawer && !hash && !claimError) {
      handleConfirmDismiss();
    }
  }, [attempting]);

  const pendingRewards = selectedPosition?.pendingRewards ?? BigNumber.from('0');

  const renderButton = () => {
    let error: string | undefined;
    if (!selectedPosition) {
      error = t('sarStakeMore.choosePosition');
    } else if (pendingRewards.isZero()) {
      error = 'No rewards to claim';
    }
    return (
      <Button variant="primary" onClick={handleConfirm} isDisabled={!!error}>
        {error ?? t('sarClaim.claim')}
      </Button>
    );
  };

  return (
    <Box>
      <Root>
        <Title selectedOption={selectedOption} onChange={onChange} />
        {!selectedPosition ? (
          <Box>
            <Text color="text1" fontSize="24px" fontWeight={500} textAlign="center">
              {t('sarStakeMore.choosePosition')}
            </Text>
          </Box>
        ) : (
          <Box>
            <Text color="text1" fontSize="16px" fontWeight={500} textAlign="center">
              {t('sarCompound.reward')}:
            </Text>
            <ToolTipText color="text1" fontSize="36px" fontWeight={500} textAlign="center">
              {numeral(formatEther(pendingRewards.toString())).format('0.00a')}
              <span className="tooltip">
                {formatEther(pendingRewards.toString())} {png.symbol}
              </span>
            </ToolTipText>
          </Box>
        )}

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
