import { Currency, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { Box, Modal, Text } from 'src/components';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { useChainId } from 'src/hooks';
import { CloseIcon } from 'src/theme/components';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import FeeTier from './FeeTier';
import PriceRange from './PriceRange';
import SelectPair from './SelectPair';
import { CurrencyInputTextBox, CurrencyInputs, FeeTiers, PValue, Wrapper } from './styles';
import { AddLiquidityProps } from './types';

// ------------------ MockData ------------------
export enum TokenField {
  INPUT0 = 'INPUT0',
  INPUT1 = 'INPUT1',
}
const FeeTiersData = [
  {
    feeTierName: '0.01%',
    description: 'Best for very stable pairs.',
    selectedPercentage: 1,
  },
  {
    feeTierName: '0.05%',
    description: 'Best for stable pairs.',
    selectedPercentage: 50,
  },
  {
    feeTierName: '0.3%',
    description: 'Best for most pairs.',
    selectedPercentage: 47,
  },
  {
    feeTierName: '1%',
    description: 'Best for exotic pairs.',
    selectedPercentage: 2,
  },
];
// ----------------------------------------------

const AddLiquidity: React.FC<AddLiquidityProps> = (props) => {
  const { t } = useTranslation();
  const { height } = useWindowSize();
  const { currency0, currency1, isOpen, onClose } = props;
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const theme = useContext(ThemeContext);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<TokenField>(TokenField.INPUT0);
  const [selectedFeeTier, setSelectedFeeTier] = useState(0);
  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      console.log(currency);
    },
    [drawerType],
  );

  const onChangeTokenDrawerStatus = useCallback(() => {
    setIsCurrencyDrawerOpen(!isCurrencyDrawerOpen);
  }, [isCurrencyDrawerOpen]);

  const onSelectRoute = useCallback(
    (index: number) => {
      setSelectedFeeTier(index);
    },
    [setSelectedFeeTier],
  );
  const percentageValue = [25, 50, 75, 100];
  const chainId = useChainId();
  const maxAmountInput = new TokenAmount(currency0 as Token, JSBI.BigInt(100000));

  const renderPercentage = () => {
    return (
      <Box display="flex" pb="5px">
        {percentageValue.map((value, index) => (
          <PValue
            key={index}
            isActive={selectedPercentage === value}
            onClick={() => {
              setSelectedPercentage(value);

              if (maxAmountInput) {
                const multipyAmount = JSBI.multiply(maxAmountInput?.raw, JSBI.BigInt(value));
                const divideAmount = JSBI.divide(multipyAmount, JSBI.BigInt(100));
                const token = wrappedCurrency(maxAmountInput?.currency ?? undefined, chainId) as Token;
                const newFinalAmount = new TokenAmount(token, divideAmount);
                console.log('newFinalAmount: ', newFinalAmount);
              }
            }}
          >
            {value}%
          </PValue>
        ))}
      </Box>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={function (): void {
        console.log('onDismiss Function not implemented.');
      }}
      overlayBG={theme.modalBG2}
      closeOnClickOutside={true}
    >
      <>
        <Wrapper maximumHeight={height - 150}>
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Text color="text1" fontSize={[32, 28]} fontWeight={500} mt={10} mb={12}>
              {t('common.addLiquidity')}
            </Text>
            <CloseIcon onClick={onClose} color={theme.text1} />
          </Box>
          <SelectPair
            onChangeTokenDrawerStatus={(tokenField: TokenField) => {
              setDrawerType(tokenField);
              onChangeTokenDrawerStatus();
            }}
          />
          <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
            {t('concentratedLiquidity.addLiquidity.selectFeeTier')}
          </Text>
          <FeeTiers>
            {FeeTiersData.map((feeTier, index) => {
              return (
                <FeeTier
                  key={index}
                  onSelectFeeTier={() => {
                    onSelectRoute(index);
                  }}
                  selected={index === selectedFeeTier}
                  feeTierName={feeTier.feeTierName}
                  description={feeTier.description}
                  selectedPercentage={feeTier.selectedPercentage}
                />
              );
            })}
          </FeeTiers>
          <PriceRange currency0={currency0} currency1={currency1} />
          <CurrencyInputs>
            <CurrencyInputTextBox
              label={`${t('common.from')}`}
              value={''}
              onChange={(value: any) => {
                setSelectedPercentage(0);
                console.log('value: ', value);
              }}
              buttonStyle={{
                cursor: 'default',
              }}
              showArrowIcon={false}
              onTokenClick={() => {}}
              currency={currency0}
              fontSize={24}
              isNumeric={true}
              placeholder="0.00"
              id="swap-currency-input"
              addonLabel={renderPercentage()}
            />
            <CurrencyInputTextBox
              label={`${t('common.to')}`}
              value={''}
              onChange={(value: any) => {
                setSelectedPercentage(0);
                console.log('value: ', value);
              }}
              buttonStyle={{
                cursor: 'default',
              }}
              showArrowIcon={false}
              onTokenClick={() => {}}
              currency={currency1}
              fontSize={24}
              isNumeric={true}
              placeholder="0.00"
              id="swap-currency-input"
              addonLabel={renderPercentage()}
            />
          </CurrencyInputs>
          {isCurrencyDrawerOpen && (
            <SelectTokenDrawer
              isOpen={isCurrencyDrawerOpen}
              onClose={() => {
                onChangeTokenDrawerStatus();
              }}
              onCurrencySelect={onCurrencySelect}
            />
          )}
        </Wrapper>
      </>
    </Modal>
  );
};

export default AddLiquidity;
