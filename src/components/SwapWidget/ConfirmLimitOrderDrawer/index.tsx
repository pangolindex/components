import { useGelatoLimitOrders } from '@gelatonetwork/limit-orders-react';
import { CAVAX, Token, Trade, TradeType } from '@pangolindex/sdk';
import React, { useCallback, useContext, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUpCircle } from 'react-feather';
import { ThemeContext } from 'styled-components';
import Drawer from 'src/components/Drawer';
import { useChainId } from 'src/hooks';
import { useUSDCPrice } from 'src/hooks/useUSDCPrice';
import { getEtherscanLink, isAddress, shortenAddress } from 'src/utils';
import { computeFiatValuePriceImpact } from 'src/utils/computeFiatValuePriceImpact';
import { Box, Button, CurrencyLogo, Loader, Text } from '../../';
import LimitOrderDetailInfo from '../LimitOrderDetailInfo';
import { FiatValue } from './FiateValue';
import {
  ErrorBox,
  ErrorWrapper,
  Footer,
  Header,
  Link,
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

const ConfirmLimitOrderDrawer: React.FC<Props> = (props) => {
  const { isOpen, onClose, trade, onAcceptChanges, recipient, onConfirm, attemptingTxn, swapErrorMessage, txHash } =
    props;
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const chainId = useChainId();
  const theme = useContext(ThemeContext);

  const {
    derivedOrderInfo: { price, parsedAmounts },
  } = useGelatoLimitOrders();

  let formattedPrice: any;
  try {
    formattedPrice = showInverted ? price?.toSignificant(4) : price?.invert()?.toSignificant(4);
  } catch (error) {
    formattedPrice = '0';
  }

  const label = showInverted ? `${price?.quoteCurrency?.symbol}` : `${price?.baseCurrency?.symbol} `;
  const labelInverted = showInverted ? `${price?.baseCurrency?.symbol} ` : `${price?.quoteCurrency?.symbol}`;

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`;

  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted]);

  const showAcceptChanges = false;

  const inputAmount = parsedAmounts.input;
  const outputAmount = parsedAmounts.output;

  const inputCurrency1 = inputAmount?.currency as any;
  const outputCurrency1 = outputAmount?.currency as any;

  const inputTokenInfo = inputCurrency1?.tokenInfo;
  const outputTokenInfo = outputCurrency1?.tokenInfo;

  const getInputCurrency = () => {
    if (inputCurrency1 && inputCurrency1?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (inputTokenInfo && inputTokenInfo.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (inputTokenInfo) {
      return new Token(
        inputTokenInfo?.chainId,
        inputTokenInfo?.address,
        inputTokenInfo?.decimals,
        inputTokenInfo?.symbol,
        inputTokenInfo?.name,
      );
    } else if (inputCurrency1) {
      return new Token(
        inputCurrency1?.chainId,
        inputCurrency1?.address,
        inputCurrency1?.decimals,
        inputCurrency1?.symbol,
        inputCurrency1?.name,
      );
    } else {
      return undefined;
    }
  };

  const getOutputCurrency = () => {
    if (outputCurrency1 && outputCurrency1?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (outputTokenInfo && outputTokenInfo?.symbol === CAVAX[chainId].symbol) {
      return CAVAX[chainId];
    } else if (outputTokenInfo) {
      return new Token(
        outputTokenInfo?.chainId,
        outputTokenInfo?.address,
        outputTokenInfo?.decimals,
        outputTokenInfo?.symbol,
        outputTokenInfo?.name,
      );
    } else if (outputCurrency1) {
      return new Token(
        outputCurrency1?.chainId,
        outputCurrency1?.address,
        outputCurrency1?.decimals,
        outputCurrency1?.symbol,
        outputCurrency1?.name,
      );
    } else {
      return undefined;
    }
  };

  const inputCurrency = getInputCurrency();
  const outputCurrency = getOutputCurrency();
  const fiatValueInput = useUSDCPrice(inputCurrency);
  const fiatValueOutput = useUSDCPrice(outputCurrency);

  if (!inputAmount || !outputAmount) return null;

  // text to show while loading
  const pendingText = `Submitting order to swap ${trade?.inputAmount?.toSignificant(6)} ${
    inputCurrency?.symbol
  } for ${trade?.outputAmount?.toSignificant(6)} ${outputCurrency?.symbol}`;

  const ConfirmContent = (
    <Root>
      <Header>
        <TokenRow>
          <CurrencyLogo currency={inputCurrency} size={24} imageSize={48} />
          <Text
            fontSize={24}
            fontWeight={500}
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? 'primary' : 'swapWidget.primary'}
            style={{ marginLeft: '12px' }}
          >
            {inputAmount.toSignificant(6)}
          </Text>
          <Text color="swapWidget.primary" fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
            {inputCurrency?.symbol}
          </Text>
        </TokenRow>
        <ArrowDown
          size="16"
          color={theme.swapWidget?.interactiveColor}
          style={{ marginLeft: '4px', minWidth: '16px' }}
        />
        <TokenRow>
          <CurrencyLogo currency={outputCurrency} size={24} imageSize={48} />

          <Box display="flex" alignItems="center">
            <Text
              fontSize={24}
              fontWeight={500}
              style={{ marginLeft: '12px' }}
              color={showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT ? 'primary' : 'swapWidget.primary'}
            >
              {outputAmount.toSignificant(6)}
            </Text>

            <FiatValue
              fiatValue={fiatValueOutput as any}
              priceImpact={computeFiatValuePriceImpact(fiatValueInput as any, fiatValueOutput as any) as any}
            />
          </Box>
          <Text color="swapWidget.primary" fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
            {outputCurrency?.symbol}
          </Text>
        </TokenRow>
        {showAcceptChanges && (
          <PriceUpdateBlock>
            <Text color="swapWidget.primary" fontSize={14}>
              Price Updated
            </Text>
            <Button onClick={onAcceptChanges} variant="primary" width={150} padding="5px 10px">
              Accept
            </Button>
          </PriceUpdateBlock>
        )}

        <Box
          mt={'30px'}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          onClick={flipPrice}
          style={{ cursor: 'pointer' }}
        >
          <Text color="swapWidget.primary" fontSize={16}>
            Limit Price
          </Text>
          <Text color="swapWidget.primary" fontSize={16}>
            {text}
          </Text>
        </Box>
        <Box mt={'15px'}>
          <Text color="swapWidget.primary" fontSize={16}>
            Output will be sent to{' '}
            <b title={recipient || ''}>
              {isAddress(recipient || '') ? shortenAddress(recipient || '', chainId) : recipient || ''}
            </b>
          </Text>
        </Box>
      </Header>
      <Footer>
        <LimitOrderDetailInfo trade={trade} />
        <Box my={'10px'}>
          <Button variant="primary" onClick={onConfirm} isDisabled={showAcceptChanges}>
            Confirm Order
          </Button>
        </Box>
      </Footer>
    </Root>
  );

  const PendingContent = <Loader size={100} label={pendingText} />;

  const ErroContent = (
    <ErrorWrapper>
      <ErrorBox>
        <AlertTriangle color={theme.error} style={{ strokeWidth: 1.5 }} size={64} />
        <Text fontWeight={500} fontSize={16} color={'error'} style={{ textAlign: 'center', width: '85%' }}>
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
        <Text color="swapWidget.primary" fontWeight={500} fontSize={20}>
          Transaction Submitted
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
            View on explorer
          </Link>
        )}
      </Box>
      <Button variant="primary" onClick={onClose}>
        Close
      </Button>
    </SubmittedWrapper>
  );

  const getSwapError = () => {
    if (swapErrorMessage) {
      return ErroContent;
    } else if (txHash) {
      return SubmittedContent;
    } else if (attemptingTxn) {
      return PendingContent;
    } else {
      return ConfirmContent;
    }
  };

  return (
    <Drawer
      title={swapErrorMessage || txHash || attemptingTxn ? '' : 'Confirm Order'}
      isOpen={isOpen}
      onClose={onClose}
    >
      {getSwapError()}
    </Drawer>
  );
};
export default ConfirmLimitOrderDrawer;
