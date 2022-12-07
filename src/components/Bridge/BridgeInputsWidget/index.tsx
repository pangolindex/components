import { Chain, Currency } from '@pangolindex/sdk';
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
    onChangeRecipient,
    onChangeAmount,
    handleMaxInput,
    recipient,
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

  const handleChangeRecipient = useCallback(
    (recipient: string) => {
      onChangeRecipient && onChangeRecipient(recipient);
    },
    [onChangeRecipient],
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
          chain={chain as Chain}
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
      {chain?.evm === false && (
        <Box pt={20}>
          <TextInput
            label={t('bridge.bridgeInputsWidget.recipient')}
            placeholder={t('bridge.bridgeInputsWidget.walletAddress')}
            value={recipient as string}
            required={true}
            onChange={(value) => {
              const withoutSpaces: string = value.replace(/\s+/g, '');
              handleChangeRecipient(withoutSpaces);
            }}
            addonLabel={
              recipient &&
              !recipient.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/) && <Text color="warning">Invalid Address</Text>
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default BridgeInputsWidget;
