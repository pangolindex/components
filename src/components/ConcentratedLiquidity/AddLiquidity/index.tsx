/* eslint-disable max-lines */
import { Currency, FeeAmount, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { ThemeContext } from 'styled-components';
import { Box, Modal, Text } from 'src/components';
import LiquidityChartRangeInput from 'src/components/LiquidityChartRangeInput';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { PNG } from 'src/constants/tokens';
import { useChainId } from 'src/hooks';
import { Bound, Field } from 'src/state/pmint/concentratedLiquidity/atom';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useRangeHopCallbacks,
} from 'src/state/pmint/concentratedLiquidity/hooks';
import {
  useConcentratedPositionFromTokenId,
  useDerivedPositionInfo,
} from 'src/state/pwallet/concentratedLiquidity/hooks/evm';
import { CloseIcon } from 'src/theme/components';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import FeeSelector from './FeeSelector';
import PriceGraph from './PriceGraph';
import PriceRange from './PriceRange';
import SelectPair from './SelectPair';
import {
  CurrencyInputTextBox,
  CurrencyInputs,
  DynamicSection,
  InputText,
  InputValue,
  InputWrapper,
  PValue,
  Wrapper,
} from './styles';
import { AddLiquidityProps } from './types';

const AddLiquidity: React.FC<AddLiquidityProps> = (props) => {
  const { t } = useTranslation();
  const { height } = useWindowSize();
  const chainId = useChainId();

  const { isOpen, onClose } = props;
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const theme = useContext(ThemeContext);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<Field>(Field.CURRENCY_A);

  // mint state
  const { independentField, typedValue, feeAmount, startPriceTypedValue } = useMintState();

  // TODO check tokenId
  // const tokenId = 'klasjdkasjkldj';
  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useConcentratedPositionFromTokenId(undefined);
  const hasExistingPosition = !!existingPositionDetails && !positionLoading;
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails);

  const {
    dependentField,
    noLiquidity,
    currencies,
    price,
    invertPrice,
    ticks,
    pricesAtTicks,
    pool,
    ticksAtLimit,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
  } = useDerivedMintInfo(existingPosition);

  const {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onCurrencySelection,
    onSetFeeAmount,
    onStartPriceInput,
  } = useMintActionHandlers(noLiquidity);

  const currency0 = currencies[Field.CURRENCY_A];
  const currency1 = currencies[Field.CURRENCY_B];

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    // [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    [dependentField]: '',
  };

  const onChangeTokenDrawerStatus = useCallback(() => {
    setIsCurrencyDrawerOpen(!isCurrencyDrawerOpen);
  }, [isCurrencyDrawerOpen]);

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onSetFeeAmount(newFeeAmount);
      onLeftRangeInput('');
      onRightRangeInput('');
    },
    [onSetFeeAmount, onLeftRangeInput, onRightRangeInput],
  );

  const switchCurrencies = useCallback(() => {
    if (currency1 && currency0) {
      const temp = currency0;
      onCurrencySelection(Field.CURRENCY_A, currency1);
      onCurrencySelection(Field.CURRENCY_B, temp);
    }
  }, [currency0, currency1]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (drawerType === Field.CURRENCY_A) {
        if (currency1 === currency) {
          switchCurrencies();
        } else {
          onCurrencySelection(Field.CURRENCY_A, currency);
        }
      } else {
        if (currency0 === currency) {
          switchCurrencies();
        } else {
          onCurrencySelection(Field.CURRENCY_B, currency);
        }
      }
    },
    [drawerType, switchCurrencies, currency0, currency1],
  );

  const percentageValue = [25, 50, 75, 100];
  const png = PNG[chainId];
  const maxAmountInput = new TokenAmount(png as Token, JSBI.BigInt(100000));

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks;
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(
    currency0 ?? undefined,
    currency1 ?? undefined,
    feeAmount,
    tickLower,
    tickUpper,
    pool,
  );

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

          {!hasExistingPosition && (
            <>
              <SelectPair
                onChangeTokenDrawerStatus={(tokenField: Field) => {
                  setDrawerType(tokenField);
                  onChangeTokenDrawerStatus();
                }}
                currency0={currency0}
                currency1={currency1}
              />

              <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
                {t('concentratedLiquidity.addLiquidity.selectFeeTier')}
              </Text>

              <FeeSelector
                handleFeePoolSelect={handleFeePoolSelect}
                disabled={!currency0 || !currency1}
                feeAmount={feeAmount}
                currency0={currency0}
                currency1={currency1}
              />
            </>
          )}
          <DynamicSection disabled={!feeAmount || invalidPool}>
            {!noLiquidity ? (
              <LiquidityChartRangeInput
                currency0={currency0}
                currency1={currency1}
                feeAmount={feeAmount}
                ticksAtLimit={ticksAtLimit}
                price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}
                priceLower={priceLower}
                priceUpper={priceUpper}
                onLeftRangeInput={onLeftRangeInput}
                onRightRangeInput={onRightRangeInput}
                interactive={!hasExistingPosition}
              />
            ) : (
              <Box>
                <Text color="text1" fontSize={18} fontWeight={500} mt={10} mb={'6px'}>
                  Set Starting Price
                </Text>

                {noLiquidity && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    padding="10px"
                    bgColor="color5"
                    borderRadius="8px"
                    margin="auto"
                    flexGrow={1}
                    mb={10}
                  >
                    <Text fontSize={14} textAlign="left" color="text1" lineHeight={'20px'}>
                      This pool must be initialized before you can add liquidity. To initialize, select a starting price
                      for the pool. Then, enter your liquidity price range and deposit amount. Gas fees will be higher
                      than usual due to the initialization transaction.
                    </Text>
                  </Box>
                )}

                <InputWrapper>
                  <InputText
                    value={startPriceTypedValue}
                    onChange={(value: any) => {
                      onStartPriceInput(value);
                    }}
                    fontSize={24}
                    isNumeric={true}
                    placeholder="0.00"
                  />

                  <InputValue>
                    <Text fontSize={14} style={{ fontWeight: 500 }} textAlign="left" color="text1">
                      Current {currency0?.symbol} Price:
                    </Text>

                    {price ? (
                      <Box display="flex">
                        <Text fontSize={14} style={{ fontWeight: 500 }} textAlign="left" color="text1">
                          {invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)}
                        </Text>{' '}
                        <span style={{ marginLeft: '4px' }}>{currency1?.symbol}</span>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </InputValue>
                </InputWrapper>
              </Box>
            )}
          </DynamicSection>

          <DynamicSection disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}>
            <PriceRange
              priceLower={priceLower}
              priceUpper={priceUpper}
              getDecrementLower={getDecrementLower}
              getIncrementLower={getIncrementLower}
              getDecrementUpper={getDecrementUpper}
              getIncrementUpper={getIncrementUpper}
              onLeftRangeInput={onLeftRangeInput}
              onRightRangeInput={onRightRangeInput}
              currencyA={currency0}
              currencyB={currency1}
              feeAmount={feeAmount}
              ticksAtLimit={ticksAtLimit}
            />
            {outOfRange ? (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                padding="10px"
                bgColor="color5"
                borderRadius="8px"
                margin="auto"
                flexGrow={1}
                mt={10}
              >
                <Text fontSize={14} textAlign="left" color="text1">
                  Your position will not earn fees or be used in trades until the market price moves into your range.
                </Text>
              </Box>
            ) : null}
            {invalidRange ? (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                padding="10px"
                bgColor="color5"
                borderRadius="8px"
                margin="auto"
                flexGrow={1}
                mt={10}
              >
                <Text fontSize={14} textAlign="left" color="text1">
                  Invalid range selected. The min price must be lower than the max price.
                </Text>
              </Box>
            ) : null}
          </DynamicSection>

          <DynamicSection disabled={tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange}>
            <CurrencyInputs>
              {depositADisabled ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  padding="10px"
                  bgColor="color5"
                  borderRadius="8px"
                  margin="auto"
                  flexGrow={1}
                  mt={10}
                >
                  <Text fontSize={14} textAlign="left" color="text1">
                    The market price is outside your specified price range. Single-asset deposit only.
                  </Text>
                </Box>
              ) : (
                <CurrencyInputTextBox
                  label={`${t('common.from')}`}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onChange={(value: any) => {
                    setSelectedPercentage(0);
                    onFieldAInput(value);
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
              )}

              {depositBDisabled ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  padding="10px"
                  bgColor="color5"
                  borderRadius="8px"
                  margin="auto"
                  flexGrow={1}
                  mt={10}
                >
                  <Text fontSize={14} textAlign="left" color="text1">
                    The market price is outside your specified price range. Single-asset deposit only.
                  </Text>
                </Box>
              ) : (
                <CurrencyInputTextBox
                  label={`${t('common.to')}`}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onChange={(value: any) => {
                    setSelectedPercentage(0);

                    onFieldBInput(value);
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
              )}
            </CurrencyInputs>
          </DynamicSection>
          {isCurrencyDrawerOpen && (
            <SelectTokenDrawer
              isOpen={isCurrencyDrawerOpen}
              onClose={() => {
                onChangeTokenDrawerStatus();
              }}
              onCurrencySelect={handleCurrencySelect}
            />
          )}
        </Wrapper>
      </>
    </Modal>
  );
};

export default AddLiquidity;
/* eslint-enable max-lines */
