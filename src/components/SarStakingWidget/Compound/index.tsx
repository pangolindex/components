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
import { Position, useDerivativeSarCompound } from 'src/state/psarstake/hooks';
import { ToolTipText } from '../Claim/styleds';
import ConfirmDrawer from '../ConfirmDrawer';
import Title from '../Title';
import { Options } from '../types';
import { Root } from './styleds';
interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Compound({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();

  const { attempting, hash, compoundError, wrappedOnDismiss, onCompound } = useDerivativeSarCompound(selectedPosition);

  const { t } = useTranslation();

  const oldBalance = selectedPosition?.balance;
  const newBalance = oldBalance?.add(selectedPosition?.pendingRewards ?? 0);

  const apr = selectedPosition?.apr;

  // Fix to show the correct apr
  const newAPR = selectedPosition?.rewardRate
    .mul(86400)
    .mul(365)
    .mul(100)
    .div(newBalance ?? 1);

  const handleConfirmDismiss = useCallback(() => {
    setOpenDrawer(false);
    wrappedOnDismiss();
  }, []);

  const handleConfirm = useCallback(() => {
    setOpenDrawer(true);
    onCompound();
  }, [onCompound]);

  useEffect(() => {
    if (!attempting && openDrawer && !hash && !compoundError) {
      handleConfirmDismiss();
    }
  }, [attempting]);

  const pendingRewards = selectedPosition?.pendingRewards ?? BigNumber.from('0');

  const png = PNG[chainId];

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
              <Text color="text2">{t('sarCompound.aprAfter')}</Text>
              <Text color="text1">{(newAPR ?? '-').toString()}%</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            {t('sarCompound.description')}
          </Text>
        </Box>
        <Button variant="primary" onClick={handleConfirm} isDisabled={!selectedPosition}>
          {!selectedPosition ? t('sarStakeMore.choosePosition') : t('sarCompound.compound')}
        </Button>
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
