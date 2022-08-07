import { CurrencyAmount, Token } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { usePangolinWeb3 } from 'src/hooks';
import { Position } from 'src/state/psarstake/hooks';
import { getEtherscanLink } from 'src/utils';
import { Box, Button, CurrencyLogo, Loader, Stat, Text } from '../../..';
import { ErrorBox, ErrorWrapper, Footer, Header, Link, Root, SubmittedWrapper, TokenRow } from './styled';

interface Props {
  unstakeAmount?: CurrencyAmount;
  token: Token;
  position: Position;
  attemptingTxn: boolean;
  txHash: string | null;
  onConfirm: () => void;
  errorMessage: string | null;
  onClose: () => void;
}

const DrawerContent: React.FC<Props> = (props) => {
  const { unstakeAmount, token, position, attemptingTxn, errorMessage, txHash, onClose, onConfirm } = props;

  const { chainId } = usePangolinWeb3();
  const theme = useContext(ThemeContext);

  const { t } = useTranslation();

  const ConfirmContent = (
    <Root>
      <Header>
        <TokenRow>
          <Text fontSize={24} fontWeight={500} color="text1" style={{ marginRight: '12px' }}>
            {t('sarUnstake.unstaking', { balance: unstakeAmount?.toSignificant(6) ?? 0 })}
          </Text>
          <CurrencyLogo currency={token} size={24} imageSize={48} />
        </TokenRow>
        <Box display="inline-grid" style={{ gridGap: '10px', gridTemplateColumns: 'auto auto' }}>
          <Stat
            title={t('sarUnstake.currentAPR')}
            titlePosition="top"
            stat={`${(position.apr ?? '-').toString()}%`}
            titleColor="text2"
          />
          <Stat title={t('sarStakeMore.newAPR')} titlePosition="top" stat={'0%'} titleColor="text2" />
        </Box>
        <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
          {t('sarUnstake.confirmDescription')}
        </Text>
      </Header>
      <Footer>
        <Box my={'10px'}>
          <Button variant="primary" onClick={onConfirm}>
            {t('sarUnstake.unstake')}
          </Button>
        </Box>
      </Footer>
    </Root>
  );

  const PendingContent = (
    <Loader
      size={100}
      label={t('sarUnstake.pending', { balance: unstakeAmount?.toSignificant(2) ?? 0, symbol: token.symbol })}
    />
  );

  const ErroContent = (
    <ErrorWrapper>
      <ErrorBox>
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'red1'} style={{ textAlign: 'center', width: '85%' }}>
          {errorMessage}
        </Text>
      </ErrorBox>
      <Button variant="primary" onClick={onClose}>
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
          {t('sarUnstake.successSubmit')}
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

  if (errorMessage) {
    return ErroContent;
  }
  if (txHash) {
    return SubmittedContent;
  }
  if (attemptingTxn) {
    return PendingContent;
  }
  return ConfirmContent;
};

export default DrawerContent;
