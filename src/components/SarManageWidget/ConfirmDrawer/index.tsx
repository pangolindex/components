import React, { useContext } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { Drawer } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import { getEtherscanLink } from 'src/utils';
import { Box, Button, Loader, Text } from '../../..';
import { ErrorBox, ErrorWrapper, Link, SubmittedWrapper } from './styled';

interface Props {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash: string | null;
  title?: string;
  errorMessage: string | null;
  pendingMessage: string;
  successMessage: string;
  confirmContent: JSX.Element | null;
  onClose: () => void;
}

const ConfirmDrawer: React.FC<Props> = (props) => {
  const {
    isOpen,
    attemptingTxn,
    title,
    errorMessage,
    pendingMessage,
    successMessage,
    txHash,
    confirmContent,
    onClose,
  } = props;

  const { chainId } = usePangolinWeb3();
  const theme = useContext(ThemeContext);

  const { t } = useTranslation();

  const PendingContent = <Loader size={100} label={pendingMessage} />;

  const ErroContent = (
    <ErrorWrapper paddingX="30px" paddingBottom="30px">
      <ErrorBox>
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'red1'} textAlign="center" style={{ width: '85%' }}>
          {errorMessage}
        </Text>
      </ErrorBox>
      <Button variant="primary" onClick={onClose}>
        {t('transactionConfirmation.dismiss')}
      </Button>
    </ErrorWrapper>
  );

  const SubmittedContent = (
    <SubmittedWrapper paddingX="30px" paddingBottom="30px">
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" paddingY={'20px'}>
        <Box flex="1" display="flex" alignItems="center">
          <img src={CircleTick} alt="circle-tick" />
        </Box>
        <Text fontSize={16} color="text1" textAlign="center">
          {successMessage}
          <br />
          {t('sarStake.yourAprRecalculated')}
        </Text>
        {chainId && txHash && (
          <Link
            as="a"
            fontWeight={500}
            fontSize={14}
            color={'primary'}
            href={getEtherscanLink(chainId, txHash, 'transaction')}
            target="_blank"
          >
            {t('transactionConfirmation.viewExplorer')}
          </Link>
        )}
      </Box>
      <Button variant="primary" onClick={onClose}>
        {t('transactionConfirmation.close')}
      </Button>
    </SubmittedWrapper>
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
    return confirmContent;
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title}>
      {renderBody()}
    </Drawer>
  );
};

export default ConfirmDrawer;
