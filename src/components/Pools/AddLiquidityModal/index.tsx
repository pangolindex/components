import { CAVAX, Currency } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, Modal, Text } from 'src/components';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { useChainId } from 'src/hooks';
import { useCurrency } from 'src/hooks/useCurrency';
import useParsedQueryString from 'src/hooks/useParsedQueryString';
import { SpaceType } from 'src/state/pstake/types';
import { useCreatePairHook } from 'src/state/pwallet/hooks';
import { CloseIcon } from 'src/theme/components';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import AddLiquidity from '../AddLiquidity';
import SearchTokenSection, { BodyState, Fields } from './SearchToken';
import { Wrapper } from './styleds';

export interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLiquidityModal = ({ isOpen, onClose }: AddLiquidityModalProps) => {
  const theme = useContext(ThemeContext);
  const chainId = useChainId();

  const { t } = useTranslation();

  const [activeField, setActiveField] = useState<number>(Fields.TOKEN0);
  const [currency0, setCurrency0] = useState<Currency | undefined>(CAVAX[chainId]);
  const [currency1, setCurrency1] = useState<Currency | undefined>(undefined);

  const [showSearch, setShowSearch] = useState<boolean>(false);

  const [bodyState, setBodyState] = useState<BodyState>(BodyState.SELECT_TOKENS);

  const useCreatePair = useCreatePairHook[chainId];
  const createPair = useCreatePair();

  const parsedQs = useParsedQueryString();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(parsedQs?.currency0 as string),
    useCurrency(parsedQs?.currency1 as string),
  ];

  useEffect(() => {
    if (loadedInputCurrency) {
      setCurrency0(loadedInputCurrency);
    }
    if (loadedOutputCurrency) {
      setCurrency1(loadedOutputCurrency);
    }
  }, [loadedInputCurrency, loadedOutputCurrency]);

  const onTokenClick = useCallback(
    (field: Fields) => {
      setActiveField(field);
      setShowSearch(true);
    },
    [setActiveField, setShowSearch],
  );

  async function onButtonClick(value?: BodyState) {
    if (!chainId || !value) return;

    try {
      // if chain doesn't require explicit createPair for e.g. evm chain doesn't require explicit create pair
      // or if value is ADD_LIQUIDITY then go to add liq
      if (!createPair || value === BodyState.ADD_LIQUIDITY) {
        setBodyState(value);
      } else {
        const tokenA = currency0 ? wrappedCurrency(currency0, chainId) : undefined;
        const tokenB = currency1 ? wrappedCurrency(currency1, chainId) : undefined;

        const createPairData = {
          tokenA,
          tokenB,
        };

        await createPair(createPairData);
      }
    } catch (err) {
      const _err = err as any;

      console.error(_err);
    }
  }

  const switchCurrencies = useCallback(() => {
    const temp = currency0;
    setCurrency0(currency1);
    setCurrency1(temp);
  }, [currency0, currency1]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      setShowSearch(false);
      if (activeField === Fields.TOKEN0) {
        if (currency1 === currency) {
          switchCurrencies();
        } else {
          setCurrency0(currency);
        }
      } else {
        if (currency0 === currency) {
          switchCurrencies();
        } else {
          setCurrency1(currency);
        }
      }
    },
    [activeField, switchCurrencies, currency0, currency1],
  );

  const handleClose = useCallback(() => {
    setShowSearch(false);
  }, [setShowSearch]);

  function renderTitle() {
    if (bodyState === BodyState.SELECT_TOKENS) {
      return t('poolFinder.selectToken');
    } else if (bodyState === BodyState.ADD_LIQUIDITY) {
      return t('poolFinder.addLiquidity');
    } else {
      return t('navigationTabs.createPair');
    }
  }

  function renderBody() {
    if (bodyState === BodyState.SELECT_TOKENS) {
      return (
        <>
          <SearchTokenSection
            currency0={currency0}
            currency1={currency1}
            onTokenClick={onTokenClick}
            onClick={onButtonClick}
          />
          <SelectTokenDrawer
            isOpen={showSearch}
            selectedCurrency={activeField === Fields.TOKEN0 ? currency0 : currency1}
            otherSelectedCurrency={activeField === Fields.TOKEN0 ? currency1 : currency0}
            onCurrencySelect={handleCurrencySelect}
            onClose={handleClose}
          />
        </>
      );
    } else if (currency0 && currency1) {
      return (
        <AddLiquidity
          currencyA={currency0}
          currencyB={currency1}
          type={SpaceType.card}
          onComplete={() => setBodyState(0)}
        />
      );
    }
    return <></>;
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} overlayBG={theme.modalBG2}>
      <Wrapper>
        <Box p={10} display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Text color="text1" fontSize={[24, 18]} fontWeight={500}>
            {renderTitle()}
          </Text>
          <CloseIcon
            onClick={() => {
              if (bodyState === BodyState.SELECT_TOKENS) {
                onClose();
              } else {
                setBodyState(0);
              }
            }}
            color={theme.text1}
          />
        </Box>
        <Box width="100%">{renderBody()}</Box>
      </Wrapper>
    </Modal>
  );
};

export default AddLiquidityModal;
