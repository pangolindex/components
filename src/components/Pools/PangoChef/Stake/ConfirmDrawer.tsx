import { Currency, CurrencyAmount, Token } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { Box, Button, DoubleCurrencyLogo, Drawer, Loader, Stat, Text } from 'src/components';
import { usePangolinWeb3 } from 'src/hooks';
import { SpaceType } from 'src/state/pstake/types';
import { getEtherscanLink } from 'src/utils';
import { ContentWrapper, ErrorBox, ErrorWrapper, Link, SubmittedWrapper } from './styleds';

interface Props {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash?: string;
  errorMessage?: string;
  type: SpaceType;
  onClose: () => void;
  onStake: () => Promise<void>;
  tokens: (Token | Currency)[];
  amount: CurrencyAmount | undefined;
  dollarValue: string;
  apr: string;
}

const ConfirmDrawer: React.FC<Props> = (props) => {
  const { isOpen, attemptingTxn, errorMessage, txHash, tokens, amount, dollarValue, apr, type, onClose, onStake } =
    props;

  const { chainId } = usePangolinWeb3();
  const theme = useContext(ThemeContext);

  const { t } = useTranslation();

  const PendingContent = <Loader size={100} />;

  const token0 = tokens[0];
  const token1 = tokens[1];

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
          You have successfully staked your liq. Your stakes apr will start from 0 and the longer you stay in the pool
          your share of the rewards will keep increasing.
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

  const confirmContent = (
    <ContentWrapper>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Text fontSize={'28px'} fontWeight={500} color="text1">
          {amount?.toFixed(8)} PGL
        </Text>
        <DoubleCurrencyLogo size={24} currency0={token0} currency1={token1} />
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Stat title="USD Deposited" stat={dollarValue} titlePosition="top" titleFontSize={16} statFontSize={[28, 20]} />
        <Stat title="Average APR" stat={apr} titlePosition="top" titleFontSize={16} statFontSize={[28, 20]} />
      </Box>
      <Box padding="20px" bgColor="color3" borderRadius="8px">
        <Text color="text1" textAlign="center">
          You are now adding liquidity into {token0?.symbol}-{token1?.symbol} Farm. Longer you stake in the pool better
          share of the rewards you’ll get.
        </Text>
      </Box>
      <Box alignSelf="flex-end">
        <Button variant="primary" onClick={onStake}>
          Stake
        </Button>
      </Box>
    </ContentWrapper>
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={!errorMessage && !txHash && !attemptingTxn ? 'Summary' : undefined}
      backgroundColor={type === SpaceType.card ? 'color5' : undefined}
    >
      {renderBody()}
    </Drawer>
  );
};

export default ConfirmDrawer;
