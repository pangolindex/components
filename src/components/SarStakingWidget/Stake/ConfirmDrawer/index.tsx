import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { CurrencyAmount, Token } from '@pangolindex/sdk';
import numeral from 'numeral';
import React, { useContext } from 'react';
import { AlertTriangle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import { usePangolinWeb3 } from 'src/hooks';
import { getEtherscanLink } from 'src/utils';
import { Box, Button, CurrencyLogo, Loader, Stat, Text } from '../../..';
import { ErrorBox, ErrorWrapper, Footer, Header, Link, Root, SubmittedWrapper, TokenRow } from './styled';

interface Props {
  stakeAmount?: CurrencyAmount;
  token: Token;
  dollerWorth?: number;
  weeklyPNG: BigNumber;
  attemptingTxn: boolean;
  txHash: string | null;
  onConfirm: () => void;
  errorMessage: string | null;
  onClose: () => void;
}

const DrawerContent: React.FC<Props> = (props) => {
  const { stakeAmount, token, dollerWorth, weeklyPNG, attemptingTxn, errorMessage, txHash, onClose, onConfirm } = props;

  const { chainId } = usePangolinWeb3();
  const theme = useContext(ThemeContext);

  // text to show while loading
  const pendingText = `Staking ${stakeAmount?.toSignificant(6) ?? 0} ${token.symbol}`;

  const ConfirmContent = (
    <Root paddingX="20px" paddingBottom="20px">
      <Header>
        <TokenRow>
          <Text fontSize={24} fontWeight={500} color="text1" style={{ marginRight: '12px' }}>
            {stakeAmount?.toSignificant(6) ?? 0}
          </Text>
          <CurrencyLogo currency={token} size={24} imageSize={48} />
        </TokenRow>
        <Box display="inline-grid" style={{ gridGap: '10px', gridTemplateColumns: 'auto auto' }}>
          <Stat title="Dolar Value" titlePosition="top" stat={`${dollerWorth ?? 0}$`} titleColor="text2" />
          <Stat title="Starting APR" titlePosition="top" stat={'0%'} titleColor="text2" />
        </Box>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Text color="text1">Weekly PNG Distributed</Text>
          <Text color="text1">
            {numeral(formatEther(weeklyPNG)).format('0.00a')} {token.symbol}
          </Text>
        </Box>
        <Box bgColor="color3" borderRadius="4px" padding="15px">
          <Text color="text1" fontWeight={400} fontSize="14px" textAlign="center">
            A stake action will create a SAR Nft for you. With this NFT you can manage your PSB stake.
          </Text>
        </Box>
      </Header>
      <Footer>
        <Box my={'10px'}>
          <Button variant="primary" onClick={onConfirm}>
            Stake
          </Button>
        </Box>
      </Footer>
    </Root>
  );

  const PendingContent = <Loader size={100} label={pendingText} />;

  const ErroContent = (
    <ErrorWrapper>
      <ErrorBox>
        <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'red1'} style={{ textAlign: 'center', width: '85%' }}>
          {errorMessage}
        </Text>
      </ErrorBox>
      <Button variant="primary" onClick={onClose}>
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
          You have successfully staked your token.
        </Text>
        <Text fontSize={16} color="text1">
          Your APR will be recalculated.
        </Text>
        {chainId && txHash && (
          <Link
            as="a"
            fontWeight={500}
            fontSize={14}
            color={'primary'}
            href={getEtherscanLink(chainId, txHash, 'transaction')}
          >
            View on explorer
          </Link>
        )}
      </Box>
      <Button variant="primary" onClick={onClose}>
        Close
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
