import { formatEther } from '@ethersproject/units';
import numeral from 'numeral';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { Drawer } from 'src/components';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button';
import { Loader } from 'src/components/Loader';
import { Text } from 'src/components/Text';
import { useChainId } from 'src/hooks';
import { Position, useDerivativeSarCompound } from 'src/state/psarstake/hooks';
import { getEtherscanLink } from 'src/utils';
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
      return;
    }
  }, [attempting]);

  const pendingText = 'Compounding';
  const PendingContent = <Loader size={100} label={pendingText} />;

  const ErroContent = (
    <ErrorWrapper>
      <ErrorBox>
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'red1'} style={{ textAlign: 'center', width: '85%' }}>
          {compoundError}
        </Text>
      </ErrorBox>
      <Button variant="primary" onClick={handleConfirmDismiss}>
        Dismiss
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
          You have successfully compounded your position.
        </Text>
        <Text fontSize={16} color="text1">
          Your APR will be recalculated.
        </Text>
        {chainId && hash && (
          <Link
            as="a"
            fontWeight={500}
            fontSize={14}
            color={'primary'}
            href={getEtherscanLink(chainId, hash, 'transaction')}
          >
            View on explorer
          </Link>
        )}
      </Box>
      <Button variant="primary" onClick={handleConfirmDismiss}>
        Close
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
              Choose a Position
            </Text>
          </Box>
        ) : (
          <Box>
            <Text color="text1" fontSize="16px" fontWeight={500} textAlign="center">
              Rewards accrued:
            </Text>
            <Text color="text1" fontSize="36px" fontWeight={500} textAlign="center">
              {numeral(formatEther((selectedPosition?.pendingRewards ?? 0).toString())).format('0.00a')}
            </Text>
          </Box>
        )}

        <Box display="grid" bgColor="color3" borderRadius="4px" padding="20px" style={{ gridGap: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Text color="text2">Current APR</Text>
              <Text color="text1">{(apr ?? '-').toString()}%</Text>
            </Box>
            <Box>
              <Text color="text2">APR After Compound</Text>
              <Text color="text1">{(newAPR ?? '-').toString()}%</Text>
            </Box>
          </Box>
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            It&apos;s worth being aware that compunding your rewards may decrease your average APR. Newly staked tokens
            will start from 0 while the old tokens will continue with the same APR. This creates an average that will be
            shown to you.
          </Text>
        </Box>
        <Button variant="primary" onClick={handleConfirm} isDisabled={!selectedPosition}>
          {!selectedPosition ? 'Choose a Position' : 'Compound'}
        </Button>
      </Root>
      <Drawer isOpen={openDrawer && !!selectedPosition} onClose={handleConfirmDismiss}>
        {compoundError ? ErroContent : hash ? SubmittedContent : PendingContent}
      </Drawer>
    </Box>
  );
}
