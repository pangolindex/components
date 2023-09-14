import { Box, Drawer, Text, TextInput } from '@honeycomb-finance/core';
import {
  Field,
  filterTokenOrChain,
  isAddress,
  useChainId,
  usePrevious,
  useTranslation,
} from '@honeycomb-finance/shared';
import {
  useAddUserToken,
  useAllTokens,
  useSelectedListInfo,
  useTokenComparator,
  useTokenHook,
} from '@honeycomb-finance/state-hooks';
import { Hedera } from '@honeycomb-finance/wallet-connectors';
import { CAVAX, ChainId, Currency, Token, WAVAX, currencyEquals } from '@pangolindex/sdk';
import deepEqual from 'deep-equal';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import CurrencyGrid from 'src/components/CurrencyGrid';
import TokenListDrawer from 'src/components/TokenListDrawer';
import { CurrencyList, ListLogo, ManageList } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency?: Currency;
  otherSelectedCurrency?: Currency;
  seletedField?: Field;
}

const currencyKey = (columnIndex: number, rowIndex: number, data: Currency[], chainId: ChainId): string => {
  const index = rowIndex * 4 + columnIndex;
  const currency = data[index];

  return currency instanceof Token
    ? currency.address
    : currency === CAVAX[chainId] && CAVAX[chainId]?.symbol
    ? (CAVAX[chainId]?.symbol as string)
    : `${rowIndex}-${columnIndex}`;
};

const TokenDrawer: React.FC<Props> = (props) => {
  const { isOpen, onClose, onCurrencySelect, otherSelectedCurrency, selectedCurrency, seletedField } = props;
  const chainId = useChainId();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTokenListOpen, setIsTokenListOpen] = useState<boolean>(false);
  const [invertSearchOrder] = useState<boolean>(false);
  const { t } = useTranslation();
  const useToken = useTokenHook[chainId];
  const inputRef = useRef<HTMLInputElement>(null);
  const lastOpen = usePrevious(isOpen);

  const addToken = useAddUserToken();

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const allTokens = useAllTokens();
  const selectedListInfo = useSelectedListInfo();

  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    const tokens = Object.values(allTokens);
    tokens.unshift(CAVAX[chainId] as Token);
    return filterTokenOrChain(tokens, searchQuery) as Token[];
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter((token) => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter((token) => token.symbol?.toLowerCase() !== symbolMatch[0]),
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator]);

  const currencies = useMemo(() => {
    const currency = CAVAX[chainId];
    const wrappedCurrency = WAVAX[chainId];
    // for hedera we need to remove HBAR and put WBAR in first position
    if (
      Hedera.isHederaChain(chainId) &&
      seletedField === Field.OUTPUT &&
      !deepEqual(otherSelectedCurrency, currency) &&
      otherSelectedCurrency instanceof Token &&
      !wrappedCurrency.equals(otherSelectedCurrency)
    ) {
      const _tokens = filteredSortedTokens.filter((token) => token !== currency && !wrappedCurrency.equals(token));
      return [wrappedCurrency, ..._tokens];
    }

    if (searchQuery === '') {
      // remove Currency from array and add in first position
      const _tokens = filteredSortedTokens.filter((token) => token !== CAVAX[chainId]);
      // Need to check when implement near
      // return CHAINS[chainId]?.evm ? [CAVAX[chainId], ..._tokens] : [..._tokens];
      return [currency, ..._tokens];
    }
    return filteredSortedTokens;
  }, [filteredSortedTokens, chainId]);
  //const currencies = useMemo(() => [Currency.CAVAX, ...filteredSortedTokens], [filteredSortedTokens]);

  const onSelect = useCallback(
    (currency) => {
      onCurrencySelect(currency);
      // workaround for now, if it's a custom token we will force add it
      if (currency && !allTokens[currency?.address || '']) {
        addToken(currency);
      }
      onClose();
    },
    [onCurrencySelect, onClose],
  );

  const Item = useCallback(
    ({ data, columnIndex, rowIndex, style }) => {
      const index = rowIndex * 4 + columnIndex;
      const currency: Currency = data?.[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherSelectedCurrency && currencyEquals(otherSelectedCurrency, currency));

      // add gap
      const styles = {
        ...style,
        right: Number(style.left) + 10,
        top: Number(style.top) + 10,
        width: Number(style.width) - 10,
        height: Number(style.height) - 10,
      };

      return currency ? (
        <CurrencyGrid
          style={styles}
          currency={currency}
          isSelected={isSelected}
          onSelect={onSelect}
          otherSelected={otherSelected}
        />
      ) : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCurrency, otherSelectedCurrency, onCurrencySelect, onClose],
  );

  return (
    <Drawer title={t('currencyInputPanel.selectToken')} isOpen={isOpen} onClose={onClose}>
      {/* Render Search Token Input */}
      <Box padding="0px 10px">
        <TextInput
          placeholder={t('common.search')}
          onChange={(value: any) => {
            setSearchQuery(value as string);
          }}
          value={searchQuery}
          getRef={(ref: HTMLInputElement) => ((inputRef as any).current = ref)}
          onClick={() => {
            if (isMobile) {
              inputRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </Box>
      {/* Render All Selected Tokens */}
      <CurrencyList>
        {currencies.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeGrid
                height={height}
                columnWidth={(width - 10) / 4}
                rowHeight={110}
                columnCount={4}
                rowCount={Math.ceil(currencies.length / 4)}
                width={width}
                itemData={currencies}
                itemKey={({ columnIndex, rowIndex, data }) => currencyKey(columnIndex, rowIndex, data, chainId)}
                style={{ overflowX: 'hidden' }}
              >
                {Item}
              </FixedSizeGrid>
            )}
          </AutoSizer>
        ) : (
          <Box mt="10px" height="100%">
            <Text color="text1" textAlign="center">
              {t('common.notFound')}
            </Text>
          </Box>
        )}
      </CurrencyList>
      {/* Render Selected Token List Info */}
      <ManageList onClick={() => setIsTokenListOpen(true)}>
        {selectedListInfo.multipleSelected ? (
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Text fontSize={14} color="swapWidget.primary">
              {selectedListInfo.selectedCount} {t('searchModal.listsSelected')}
            </Text>
            <Text fontSize={12} color="swapWidget.primary">
              {t('searchModal.change')}
            </Text>
          </Box>
        ) : (
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Box display="flex" alignItems="center" width="100%">
              <ListLogo
                size={24}
                src={selectedListInfo?.current?.logoURI}
                alt={`${selectedListInfo?.current?.name} list logo`}
              />
              <Text fontSize={14} color="swapWidget.primary">
                {selectedListInfo?.current?.name}
              </Text>
            </Box>
            <Text fontSize={12} color="swapWidget.primary">
              {t('searchModal.change')}
            </Text>
          </Box>
        )}
      </ManageList>
      {/* Render Token List Selection Drawer */}
      <TokenListDrawer isOpen={isTokenListOpen} onClose={() => setIsTokenListOpen(false)} />
    </Drawer>
  );
};

const SelectTokenDrawer = memo(TokenDrawer, (prevProps, nextProps) => {
  const isEqual =
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onCurrencySelect === nextProps.onCurrencySelect &&
    prevProps.seletedField == nextProps.seletedField &&
    (!!prevProps.selectedCurrency && !!nextProps.selectedCurrency
      ? prevProps.selectedCurrency.symbol === nextProps.selectedCurrency.symbol
      : true) &&
    (!!prevProps.otherSelectedCurrency && !!nextProps.otherSelectedCurrency
      ? prevProps.otherSelectedCurrency.symbol === nextProps.otherSelectedCurrency.symbol
      : true);
  return isEqual;
});

export { SelectTokenDrawer };
