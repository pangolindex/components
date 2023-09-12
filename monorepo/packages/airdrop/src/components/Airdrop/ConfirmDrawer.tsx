import { Box, Button, Drawer, Loader, Text } from '@honeycomb/core';
import { AirdropType } from '@pangolindex/sdk';
import { getEtherscanLink, useChainId, useTranslation } from '@honeycomb/shared';
import React, { useContext } from 'react';
import { AlertTriangle, CheckCircle } from 'react-feather';
import GiftBox from 'src/assets/images/giftbox.png';
import { ThemeContext } from 'styled-components';
import Title from '../Title';
import { Wrapper } from '../Title/styleds';

interface Props {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash: string | null;
  errorMessage: string | null;
  airdropType: AirdropType;
  onClose: () => void;
  onComplete?: (airdropType: AirdropType) => void;
  logo: string;
}

export default function ConfirmDrawer({
  isOpen,
  attemptingTxn,
  errorMessage,
  txHash,
  airdropType,
  logo,
  onClose,
  onComplete,
}: Props) {
  const chainId = useChainId();

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const PendingContent = (
    <Wrapper>
      <Title title="Claiming..." logo={logo} />
      <Box display="flex" alignItems="center" justifyContent="center" flexGrow={1} paddingTop="20px">
        <Loader size={100} />
      </Box>
    </Wrapper>
  );

  const ErroContent = (
    <Wrapper style={{ overflowY: 'scroll' }}>
      <Title title="Error" color="red1" logo={logo} />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        flexGrow={1}
        paddingY="20px"
      >
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="justify" style={{ width: '85%' }}>
          {errorMessage}
        </Text>
      </Box>
      <Button variant="primary" height="46px" onClick={onClose}>
        Dimiss
      </Button>
    </Wrapper>
  );

  const SubmittedContent = (
    <Wrapper>
      <Title title="Success" color="green1" logo={logo} />
      {airdropType === AirdropType.MERKLE_TO_STAKING || airdropType === AirdropType.MERKLE_TO_STAKING_COMPLIANT ? (
        <>
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" flexGrow={1}>
            <img src={GiftBox} alt="GiftBox" />
            <Text fontSize={[22, 18]} fontWeight={700} color="primary" ml="10px">
              Wait its not over yet
            </Text>
          </Box>
          <Button variant="primary" color="black" height="46px" onClick={() => onComplete?.(airdropType)}>
            CHECK SURPRISE
          </Button>
        </>
      ) : (
        <>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" paddingY={'20px'}>
            <Box flex="1" display="flex" alignItems="center">
              <CheckCircle color={theme.green1} style={{ strokeWidth: 1.5 }} size={64} />
            </Box>
            <Text fontSize={16} color="text1" textAlign="center">
              {t('earn.claimedReward')}
            </Text>
            {chainId && txHash && (
              <Button
                variant="primary"
                color="black"
                height="46px"
                as="a"
                href={getEtherscanLink(chainId, txHash, 'transaction')}
                target=""
              >
                {t('transactionConfirmation.viewExplorer')}
              </Button>
            )}
          </Box>
          <Button variant="primary" onClick={onClose}>
            {t('transactionConfirmation.close')}
          </Button>
        </>
      )}
    </Wrapper>
  );

  const renderBody = () => {
    if (errorMessage) {
      return ErroContent;
    }
    if (txHash) {
      return SubmittedContent;
    }
    if (attemptingTxn) {
      return PendingContent;
    }
    return null;
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {renderBody()}
    </Drawer>
  );
}
