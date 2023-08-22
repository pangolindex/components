import { CAVAX, Currency, WAVAX, currencyEquals } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { ChevronDown, Plus } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { CurrencySelectWrapper, LightCard } from '../PoolImportModal/PoolImport/styleds';
import { ConfirmButton } from './styleds';
import { PairState, useChainId, usePangolinWeb3, useTranslation } from '@pangolindex/shared';
import { Box, CurrencyLogo, Text } from '@pangolindex/core';
import { usePair } from '@pangolindex/state-hooks';

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

const SearchTokenSection = ({ currency0, currency1, onTokenClick, onClick }: Props) => {
  const chainId = useChainId();
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

    if (
      (currency0 === CAVAX[chainId] && currencyEquals(WAVAX[chainId], currency1)) ||
      (currencyEquals(WAVAX[chainId], currency0) && currency1 === CAVAX[chainId])
    ) {
      return (
        <LightCard>
          <Text textAlign="center" color="text1" fontSize={[14, 12]}>
            {t('poolFinder.invalidPair')}
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

    if (pairState === PairState.LOADING) {
      return (
        <LightCard>
          <Text textAlign="center" color="text1" fontSize={[16, 12]}>
            {t('poolFinder.loading')}...
          </Text>
        </LightCard>
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
        <Text color="text1" fontSize={[12, 16]}>
          {t('poolFinder.selectToken')}
        </Text>
      );
    }

    return (
      <>
        <CurrencyLogo size={24} currency={currency} imageSize={48} />
        <Text color="text2" fontSize={[14, 16]} fontWeight={500} lineHeight="40px" marginLeft={10}>
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
      <Box paddingX="10px" paddingY="20px" bgColor="color3" mt="10px" borderRadius="8px">
        <Text color="text1" fontSize={[12, 14]} textAlign="center">
          {pairState === PairState.EXISTS ? t('pool.addLiquidityDescription') : t('pool.createPairDescription')}
        </Text>
      </Box>
      {renderButton()}
    </Box>
  );
};

export default SearchTokenSection;
