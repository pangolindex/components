import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Text } from 'src/components/Text';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { useUSDCPriceHook } from 'src/hooks/multiChainsHooks';
import { useSarStakeInfo } from 'src/state/psarstake/hooks';
import { useDerivativeSarCompoundHook } from 'src/state/psarstake/multiChainsHooks';
import { Position } from 'src/state/psarstake/types';
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
  const chainId = useChainId();

  const useDerivativeSarCompound = useDerivativeSarCompoundHook[chainId];
  const { attempting, hash, compoundError, wrappedOnDismiss, onCompound } = useDerivativeSarCompound(selectedPosition);
  const { apr } = useSarStakeInfo();

  const oldBalance = selectedPosition?.balance ?? BigNumber.from('0');
  const pendingRewards = selectedPosition?.pendingRewards ?? BigNumber.from('0');

  const png = PNG[chainId];
  const useUSDPrice = useUSDCPriceHook[chainId];
  const pngPrice = useUSDPrice(png);

  const dollarValue =
    parseFloat(formatUnits(oldBalance.add(pendingRewards), png.decimals)) * Number(pngPrice?.toFixed() ?? 0);

  const { t } = useTranslation();

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

  // if changed the position and the drawer is open, close
  useEffect(() => {
    if (openDrawer) setOpenDrawer(false);
  }, [selectedPosition]);

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
          pendingRewards={formatUnits(pendingRewards.toString(), png.decimals)}
          selectedPosition={selectedPosition}
        />

        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">{t('sarStake.dollarValue')}</Text>
              <Text color="text1">${dollarValue}</Text>
            </Box>
            <Box>
              <Text color="text2">{t('sarStake.averageAPR')}</Text>
              <Text color="text1">{(apr ?? '-').toString()}%</Text>
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
