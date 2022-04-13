import { Trade, TradeType } from '@pangolindex/sdk';
import React, { useContext, useMemo } from 'react';
import { AlertTriangle, ArrowDown, ArrowUpCircle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import Drawer from 'src/components/Drawer';
import { useActiveWeb3React } from 'src/hooks';
import { Field } from 'src/state/pswap/actions';
import { getEtherscanLink, tradeMeaningfullyDiffers } from 'src/utils';
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'src/utils/prices';
import { Box, Button, CurrencyLogo, Loader, Text } from '../../';
import SwapDetailInfo from '../SwapDetailInfo';
import {
  ErrorBox,
  ErrorWrapper,
  Footer,
  Header,
  Link,
  OutputText,
  PriceUpdateBlock,
  Root,
  SubmittedWrapper,
  TokenRow,
} from './styled';

interface Props {
  isOpen: boolean;
  trade: Trade;
  originalTrade: Trade | undefined;
  attemptingTxn: boolean;
  txHash: string | undefined;
  recipient: string | null;
  allowedSlippage: number;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onClose: () => void;
}

const ConfirmSwapDrawer: React.FC<Props> = (props) => {
  const {
    isOpen,
    onClose,
    trade,
    originalTrade,
    allowedSlippage,
    onAcceptChanges,
    onConfirm,
    attemptingTxn,
    swapErrorMessage,
    txHash,
  } = props;

  const { chainId } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage],
  );
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade],
  );

  // text to show while loading
  const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
    trade?.inputAmount?.currency?.symbol
  } for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`;

  const ConfirmContent = (
    <Root>
      <Header>
        <TokenRow>
          <CurrencyLogo currency={trade.inputAmount.currency} size={24} imageSize={48} />
          <Text
            fontSize={24}
            fontWeight={500}
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? 'primary' : 'text1'}
            style={{ marginLeft: '12px' }}
          >
            {trade.inputAmount.toSignificant(6)}
          </Text>
          <Text fontSize={24} fontWeight={500} color="text1" style={{ marginLeft: '10px' }}>
            {trade.inputAmount.currency.symbol}
          </Text>
        </TokenRow>
        <ArrowDown size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }} />
        <TokenRow>
          <CurrencyLogo currency={trade.outputAmount.currency} size={24} imageSize={48} />
          <Text
            fontSize={24}
            fontWeight={500}
            style={{ marginLeft: '12px' }}
            color={
              priceImpactSeverity > 2
                ? 'red1'
                : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                ? 'primary'
                : 'text1'
            }
          >
            {trade.outputAmount.toSignificant(6)}
          </Text>
          <Text fontSize={24} fontWeight={500} color="text1" style={{ marginLeft: '10px' }}>
            {trade.outputAmount.currency.symbol}
          </Text>
        </TokenRow>
        {showAcceptChanges && (
          <PriceUpdateBlock>
            <Text color={'text1'} fontSize={14}>
              Price Updated
            </Text>
            <Button onClick={onAcceptChanges} variant="primary" width={150} padding="5px 10px">
              Accept
            </Button>
          </PriceUpdateBlock>
        )}
        <Box mt={'15px'}>
          {trade.tradeType === TradeType.EXACT_INPUT ? (
            <OutputText color="text2">
              Output is estimated. You will receive at least
              <b>
                {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
              </b>
              or the transaction will revert.
            </OutputText>
          ) : (
            <OutputText color="text2">
              Input is estimated. You will sell at most
              <b>
                {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
              </b>
              or the transaction will revert.
            </OutputText>
          )}
        </Box>
      </Header>
      <Footer>
        <SwapDetailInfo trade={trade} />
        <Box my={'10px'}>
          <Button variant="primary" onClick={onConfirm} isDisabled={showAcceptChanges}>
            {priceImpactSeverity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
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
          {swapErrorMessage}
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
          <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary} />
        </Box>
        <Text fontWeight={500} fontSize={20} color="text1">
          Transaction Submitted
        </Text>
        {chainId && txHash && (
          <Link
            as="a"
            fontWeight={500}
            fontSize={14}
            color={'primary'}
            href={getEtherscanLink(chainId, txHash, 'transaction')}
          >
            View on the Snowtrace Explorer
          </Link>
        )}
      </Box>
      <Button variant="primary" onClick={onClose}>
        Close
      </Button>
    </SubmittedWrapper>
  );

  return (
    <Drawer title={swapErrorMessage || txHash || attemptingTxn ? '' : 'Confirm Swap'} isOpen={isOpen} onClose={onClose}>
      {swapErrorMessage ? ErroContent : txHash ? SubmittedContent : attemptingTxn ? PendingContent : ConfirmContent}
    </Drawer>
  );
};
export default ConfirmSwapDrawer;
