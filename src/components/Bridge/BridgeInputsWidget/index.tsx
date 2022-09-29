import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { Info } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, CurrencyInput, Text, TextInput, Tooltip } from 'src/components';
import { Currencies } from './styles';
import { BridgeInputsWidgetProps } from './types';

const BridgeInputsWidget: React.FC<BridgeInputsWidgetProps> = (props) => {
  const { onChangeTokenDrawerStatus, title, inputDisabled } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const currency = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );

  return (
    <Box>
      <Text fontSize={18} fontWeight={500} pb={'4px'} color={'bridge.text'}>
        {title}
      </Text>
      <Currencies>
        <CurrencyInput
          // value={formattedAmounts[LimitField.INPUT]}
          onChange={(value: any) => {
            console.log('onChange', value);
          }}
          buttonStyle={{
            backgroundColor: theme.bridge?.primaryBgColor,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onTokenClick={onChangeTokenDrawerStatus}
          isShowTextInput={false}
          currency={currency}
          fontSize={24}
          id="swap-currency-input"
        />
        <CurrencyInput
          // value={formattedAmounts[LimitField.INPUT]}
          onChange={(value: any) => {
            console.log('onChange', value);
          }}
          buttonStyle={{
            backgroundColor: theme.bridge?.primaryBgColor,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onTokenClick={onChangeTokenDrawerStatus}
          isShowTextInput={false}
          currency={currency}
          fontSize={24}
          id="swap-currency-input"
        />
      </Currencies>
      <Tooltip effect="solid" />
      <TextInput
        value={''}
        isNumeric={true}
        disabled={inputDisabled}
        placeholder="0.00"
        addonAfter={
          inputDisabled ? (
            <Info
              size={16}
              color={theme.bridge?.infoIconColor}
              data-tip={t('bridge.bridgeInputsWidget.tooltip', { amount: 10.3, currency: 'USDC' })}
            />
          ) : (
            <Button
              variant="plain"
              backgroundColor="bridge.secondaryBgColor"
              padding="6px"
              height="auto"
              onClick={() => {
                console.log('onclick');
              }}
            >
              <Text color={'bridge.text'}>{t('bridge.bridgeInputsWidget.max')}</Text>
            </Button>
          )
        }
        onChange={(value: any) => {
          console.log(value);
        }}
      />
    </Box>
  );
};

export default BridgeInputsWidget;
