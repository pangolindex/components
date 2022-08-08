import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { Drawer } from 'src/components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Loader } from 'src/components/Loader';
import { Text } from 'src/components/Text';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { Position, useDerivativeSarCompound } from 'src/state/psarstake/hooks';
import { getEtherscanLink } from 'src/utils';
import { ToolTipText } from '../Claim/styleds';
import Title from '../Title';
import { Options } from '../types';
import { ErrorBox, ErrorWrapper, Link, Root, SubmittedWrapper } from './styleds';
interface Props {
  selectedOption: Options;
  selectedPosition: Position | null;
  onChange: (value: Options) => void;
}

export default function Compound({ selectedOption, selectedPosition, onChange }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const chainId = useChainId();

  const { attempting, hash, compoundError, wrappedOnDismiss, onCompound } = useDerivativeSarCompound(selectedPosition);

  const theme = useContext(ThemeContext);

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

  const PendingContent = <Loader size={100} label={t('sarCompound.pending')} />;

  const pendingRewards = selectedPosition?.pendingRewards ?? BigNumber.from('0');

  const png = PNG[chainId];

  const ErroContent = (
    <ErrorWrapper>
      <ErrorBox>
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'red1'} style={{ textAlign: 'center', width: '85%' }}>
          {compoundError}
        </Text>
      </ErrorBox>
      <Button variant="primary" onClick={handleConfirmDismiss}>
        {t('transactionConfirmation.dismiss')}
      </Button>
    </ErrorWrapper>
  );

  const SubmittedContent = (
    <SubmittedWrapper>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" paddingY={'20px'}>
        <Box flex="1" display="flex" alignItems="center">
          <img src={CircleTick} alt="circle-tick" />
        </Box>
        <Text fontSize={16} color="text1">
          {t('sarCompound.successSubmit')}
          <br />
          {t('sarStake.yourAprRecalculated')}
        </Text>
        {chainId && hash && (
          <Link
            as="a"
            fontWeight={500}
            fontSize={14}
            color={'primary'}
            href={getEtherscanLink(chainId, hash, 'transaction')}
          >
            {t('transactionConfirmation.viewExplorer')}
          </Link>
        )}
      </Box>
      <Button variant="primary" onClick={handleConfirmDismiss}>
        {t('transactionConfirmation.close')}
      </Button>
    </SubmittedWrapper>
  );

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
      <Drawer isOpen={openDrawer && !!selectedPosition} onClose={handleConfirmDismiss}>
        {compoundError ? ErroContent : hash ? SubmittedContent : PendingContent}
      </Drawer>
    </Box>
  );
}
