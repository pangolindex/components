import { CAVAX, ChainId, Currency, Token, currencyEquals } from '@pangolindex/sdk';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import Drawer from 'src/components/Drawer';
import { useChainId } from 'src/hooks';
import { useAllTokens, useToken } from 'src/hooks/Tokens';
import usePrevious from 'src/hooks/usePrevious';
import { useSelectedListInfo } from 'src/state/plists/hooks';
import { filterTokenOrChain, isAddress } from 'src/utils';
import { Box, Text, TextInput } from '../../';
import { useTokenComparator } from '../SearchModal/sorting';
import TokenListDrawer from '../TokenListDrawer';
import CurrencyGrid from './CurrencyGrid';
import { CurrencyList, ListLogo, ManageList } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency?: Currency;
  otherSelectedCurrency?: Currency;
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

const SelectTokenDrawer: React.FC<Props> = (props) => {
  const { isOpen, onClose, onCurrencySelect, otherSelectedCurrency, selectedCurrency } = props;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTokenListOpen, setIsTokenListOpen] = useState<boolean>(false);
  const [invertSearchOrder] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastOpen = usePrevious(isOpen);

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

  const chainId = useChainId();

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
    if (searchQuery === '') {
      // remove Currency from array and add in first position
      const _tokens = filteredSortedTokens.filter((token) => token !== CAVAX[chainId]);
      // Need to check when implement near
      // return CHAINS[chainId]?.evm ? [CAVAX[chainId], ..._tokens] : [..._tokens];
      return [CAVAX[chainId], ..._tokens];
    }
    return filteredSortedTokens;
  }, [filteredSortedTokens, chainId]);
  //const currencies = useMemo(() => [Currency.CAVAX, ...filteredSortedTokens], [filteredSortedTokens]);

  const onSelect = useCallback(
    (currency) => {
      onCurrencySelect(currency);
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
        left: Number(style.left) + 10,
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
    <Drawer title="Select a token" isOpen={isOpen} onClose={onClose}>
      {/* Render Search Token Input */}
      <Box padding="0px 10px">
        <TextInput
          placeholder="Search"
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
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeGrid
              height={height}
              columnWidth={(width - 10) / 4}
              rowHeight={120}
              columnCount={4}
              rowCount={currencies.length / 4}
              width={width}
              itemData={currencies}
              itemKey={({ columnIndex, rowIndex, data }) => currencyKey(columnIndex, rowIndex, data, chainId)}
            >
              {Item}
            </FixedSizeGrid>
          )}
        </AutoSizer>
      </CurrencyList>
      {/* Render Selected Token List Info */}
      <ManageList onClick={() => setIsTokenListOpen(true)}>
        {selectedListInfo.multipleSelected ? (
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Text fontSize={14} color="swapWidget.primary">
              {selectedListInfo.selectedCount} lists selected
            </Text>
            <Text fontSize={12} color="swapWidget.primary">
              Change
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
              Change
            </Text>
          </Box>
        )}
      </ManageList>
      {/* Render Token List Selection Drawer */}
      <TokenListDrawer isOpen={isTokenListOpen} onClose={() => setIsTokenListOpen(false)} />
    </Drawer>
  );
};

export default memo(SelectTokenDrawer, (prevProps, nextProps) => {
  const isEqual =
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onCurrencySelect === nextProps.onCurrencySelect &&
    (!!prevProps.selectedCurrency && !!nextProps.selectedCurrency
      ? prevProps.selectedCurrency.symbol === nextProps.selectedCurrency.symbol
      : true) &&
    (!!prevProps.otherSelectedCurrency && !!nextProps.otherSelectedCurrency
      ? prevProps.otherSelectedCurrency.symbol === nextProps.otherSelectedCurrency.symbol
      : true);
  return isEqual;
});
