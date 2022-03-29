import { CAVAX, ChainId, Currency, Token, currencyEquals } from '@pangolindex/sdk';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import Drawer from 'src/components/Drawer';
import { useChainId } from 'src/hooks';
import { useAllTokens, useToken } from 'src/hooks/Tokens';
import usePrevious from 'src/hooks/usePrevious';
import { useSelectedListInfo } from 'src/state/plists/hooks';
import { isAddress } from 'src/utils';
import { Box, Text, TextInput } from '../../';
import { filterTokens } from '../SearchModal/filtering';
import { useTokenComparator } from '../SearchModal/sorting';
import TokenListDrawer from '../TokenListDrawer';
import CurrencyRow from './CurrencyRow';
import { CurrencyList, ListLogo, ManageList } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency?: Currency;
  otherSelectedCurrency?: Currency;
}

const currencyKey = (currency: Currency, chainId: ChainId): string => {
  return currency instanceof Token ? currency.address : currency === CAVAX[chainId] ? 'AVAX' : '';
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
    return filterTokens(Object.values(allTokens), searchQuery);
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

  const currencies = useMemo(() => [CAVAX[chainId], ...filteredSortedTokens], [filteredSortedTokens, chainId]);
  //const currencies = useMemo(() => [Currency.CAVAX, ...filteredSortedTokens], [filteredSortedTokens]);

  const onSelect = useCallback(
    (currency) => {
      onCurrencySelect(currency);
      onClose();
    },
    [onCurrencySelect, onClose],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data?.[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherSelectedCurrency && currencyEquals(otherSelectedCurrency, currency));

      return currency ? (
        <CurrencyRow
          style={style}
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
        />
      </Box>
      {/* Render All Selected Tokens */}
      <CurrencyList>
        <AutoSizer disableWidth>
          {({ height }) => (
            <FixedSizeList
              height={height}
              width="100%"
              itemCount={currencies.length}
              itemSize={56}
              itemData={currencies}
              itemKey={(index, data) => currencyKey(data[index], chainId)}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </CurrencyList>
      {/* Render Selected Token List Info */}
      <ManageList onClick={() => setIsTokenListOpen(true)}>
        {selectedListInfo.multipleSelected ? (
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Text fontSize={14} color="text1">
              {selectedListInfo.selectedCount} lists selected
            </Text>
            <Text fontSize={12} color="text1">
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
              <Text fontSize={14} color="text1">
                {selectedListInfo?.current?.name}
              </Text>
            </Box>
            <Text fontSize={12} color="text1">
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
