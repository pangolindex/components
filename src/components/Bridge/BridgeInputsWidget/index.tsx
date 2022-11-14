import { Currency } from '@pangolindex/sdk';
import React, { useCallback, useContext } from 'react';
import { Info } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, ChainInput, CurrencyInput, Text, TextInput, Tooltip } from 'src/components';
import { Currencies } from './styles';
import { BridgeInputsWidgetProps } from './types';

const BridgeInputsWidget: React.FC<BridgeInputsWidgetProps> = (props) => {
  const {
    onChangeTokenDrawerStatus,
    onChangeChainDrawerStatus,
    onChangeAmount,
    handleMaxInput,
    title,
    maxAmountInput,
    amount,
    amountNet,
    chain,
    currency,
    inputDisabled,
  } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const handleInput = useCallback(
    (amount: string) => {
      onChangeAmount && onChangeAmount(amount);
    },
    [onChangeAmount],
  );

  return (
    <Box>
      <Text fontSize={18} fontWeight={500} pb={'4px'} color={'bridge.text'}>
        {title}
      </Text>
      <Currencies>
        <ChainInput
          buttonStyle={{
            backgroundColor: theme.bridge?.primaryBgColor,
            color: theme.bridge?.text,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onChainClick={onChangeChainDrawerStatus}
          chain={chain}
        />
        <CurrencyInput
          buttonStyle={{
            backgroundColor: theme.bridge?.primaryBgColor,
            color: theme.bridge?.text,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          alternativeLogoSrc={currency?.logo}
          onTokenClick={onChangeTokenDrawerStatus}
          isShowTextInput={false}
          fontSize={24}
          currency={currency as Currency}
          id="swap-currency-input"
        />
      </Currencies>
      <Tooltip id="minEarnedAmount" effect="solid">
        {t('bridge.bridgeInputsWidget.tooltip', {
          amount: amountNet,
          currency: currency?.symbol,
        })}
      </Tooltip>
      <TextInput
        isNumeric={true}
        value={amount?.toExact()}
        onChange={(value: any) => {
          handleInput(value);
        }}
        disabled={inputDisabled || !currency}
        placeholder="0.00"
        addonAfter={
          inputDisabled ? (
            <Info size={amount ? 16 : 0} color={theme.bridge?.infoIconColor} data-tip data-for="minEarnedAmount" />
          ) : (
            currency &&
            maxAmountInput &&
            maxAmountInput?.toExact() !== amount?.toExact() && (
              <Button
                variant="plain"
                backgroundColor="bridge.secondaryBgColor"
                padding="6px"
                height="auto"
                onClick={handleMaxInput}
              >
                <Text color={'bridge.text'}>{t('bridge.bridgeInputsWidget.max')}</Text>
              </Button>
            )
          )
        }
      />
    </Box>
  );
};

export default BridgeInputsWidget;
