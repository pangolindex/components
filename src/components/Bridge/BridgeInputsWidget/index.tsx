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
    title,
    onChangeAmount,
    maxAmountInput,
    handleMaxInput,
    amount,
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
          onTokenClick={onChangeTokenDrawerStatus}
          isShowTextInput={false}
          fontSize={24}
          currency={currency}
          id="swap-currency-input"
        />
      </Currencies>
      <Tooltip effect="solid" />
      <TextInput
        isNumeric={true}
        value={amount?.toExact()}
        onChange={(value: any) => {
          handleInput(value);
        }}
        disabled={inputDisabled || !currency}
        placeholder="0.00"
        addonAfter={
          inputDisabled
            ? amount && (
                <Info
                  size={16}
                  color={theme.bridge?.infoIconColor}
                  data-tip={t('bridge.bridgeInputsWidget.tooltip', { amount: 10.3, currency: 'USDC' })}
                />
              )
            : currency &&
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
        }
      />
    </Box>
  );
};

export default BridgeInputsWidget;
