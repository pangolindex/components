import { Currency } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { ChevronDown, Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from 'styled-components';
import { Box, CurrencyLogo, Text } from 'src/components';
import { PairState, usePair } from 'src/data/Reserves';
import { usePangolinWeb3 } from 'src/hooks';
import { CurrencySelectWrapper, LightCard } from '../PoolImportModal/PoolImport/styleds';
import { ConfirmButton } from './styleds';

export enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export enum BodyState {
  SELECT_TOKENS,
  ADD_LIQUIDITY,
  CREATE_PAIR,
}

interface Props {
  currency0?: Currency;
  currency1?: Currency;
  onTokenClick: (field: Fields) => void;
  onClick: (value: number) => void;
}

const SearchToken = ({ currency0, currency1, onTokenClick, onClick }: Props) => {
  const { account } = usePangolinWeb3();
  const theme = useContext(ThemeContext);

  const { t } = useTranslation();

  const [pairState, pair] = usePair(currency0, currency1);

  function renderButton() {
    if (!account) {
      return (
        <LightCard>
          <Text textAlign="center" color="color6" fontSize={[14, 12]}>
            {t('walletModal.connectToWallet')}
          </Text>
        </LightCard>
      );
    }

    if (!currency0 || !currency1) {
      return (
        <LightCard>
          <Text textAlign="center" color="text1" fontSize={[14, 12]}>
            {t('poolFinder.selectToken')}
          </Text>
        </LightCard>
      );
    }

    if (pair) {
      return (
        <ConfirmButton onClick={() => onClick(BodyState.ADD_LIQUIDITY)}>
          {t('navigationTabs.addLiquidity')}
        </ConfirmButton>
      );
    }

    if (pairState === PairState.NOT_EXISTS || (currency0 && currency1 && !pair)) {
      return (
        <ConfirmButton onClick={() => onClick(BodyState.CREATE_PAIR)}>{t('navigationTabs.createPair')}</ConfirmButton>
      );
    }

    return (
      <LightCard>
        <Text textAlign="center" color="text1" fontSize={[16, 12]}>
          {t('poolFinder.invalidPair')}
        </Text>
      </LightCard>
    );
  }

  function renderCurrency(currency: Currency | undefined) {
    if (!currency) {
      return (
        <Text color="text1" fontSize={[16, 12]}>
          {t('poolFinder.selectToken')}
        </Text>
      );
    }

    return (
      <>
        <CurrencyLogo size={24} currency={currency} imageSize={48} />
        <Text color="text2" fontSize={[16, 14]} fontWeight={500} lineHeight="40px" marginLeft={10}>
          {currency?.symbol}
        </Text>
      </>
    );
  }

  return (
    <Box>
      <CurrencySelectWrapper
        onClick={() => {
          onTokenClick(Fields.TOKEN0);
        }}
      >
        <Box display="flex" alignItems="center">
          {renderCurrency(currency0)}
        </Box>
        <ChevronDown size="16" color={theme.text1} />
      </CurrencySelectWrapper>
      <Box display="flex" justifyContent="center" width="100%" my={10}>
        <Plus size="16" color={theme.text1} />
      </Box>
      <CurrencySelectWrapper
        onClick={() => {
          onTokenClick(Fields.TOKEN1);
        }}
      >
        <Box display="flex" alignItems="center">
          {renderCurrency(currency1)}
        </Box>
        <ChevronDown size="16" color={theme.text1} />
      </CurrencySelectWrapper>
      {renderButton()}
    </Box>
  );
};

export default SearchToken;
