import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { Info } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Button, CurrencyInput, Text, TextInput, Tooltip } from 'src/components';
import { Currencies } from './styles';
import { BridgeInputsWidgetProps } from './types';

const BridgeInputsWidget: React.FC<BridgeInputsWidgetProps> = (props) => {
  const { changeTokenDrawerStatus } = props;
  const theme = useContext(ThemeContext);

  const currency = new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol!,
    'Pangolin',
  );
  const { t } = useTranslation();

  return (
    <Box>
      <Text fontSize={18} fontWeight={500} pb={'4px'} color="text1">
        {props.title}
      </Text>
      <Currencies>
        <CurrencyInput
          // value={formattedAmounts[LimitField.INPUT]}
          onChange={(value: any) => {
            console.log('onChange', value);
          }}
          buttonStyle={{
            backgroundColor: theme.color10,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onTokenClick={changeTokenDrawerStatus}
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
            backgroundColor: theme.color10,
            padding: '1rem 1.1rem',
            width: '100%',
          }}
          onTokenClick={changeTokenDrawerStatus}
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
        disabled={props.inputDisabled}
        placeholder="0.00"
        addonAfter={
          props.inputDisabled ? (
            <Info
              size={16}
              color={theme.text1}
              data-tip={t('bridge.bridgeInputsWidget.tooltip', { amount: 10.3, currency: 'USDC' })}
            />
          ) : (
            <Button
              variant="plain"
              backgroundColor="color2"
              padding="6px"
              height="auto"
              onClick={() => {
                console.log('onclick');
              }}
            >
              <Text color="text1">{t('bridge.bridgeInputsWidget.max')}</Text>
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
