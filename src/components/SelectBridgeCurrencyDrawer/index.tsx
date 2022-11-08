import { BridgeCurrency, Currency, currencyEquals } from '@pangolindex/sdk';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import Drawer from 'src/components/Drawer';
import { useChainId } from 'src/hooks';
import { useToken } from 'src/hooks/Tokens';
import usePrevious from 'src/hooks/usePrevious';
import { isAddress } from 'src/utils';
import { Box, TextInput } from '../../';
import BridgeCurrencyRow from './BridgeCurrencyRow';
import { filterBridgeCurrencies } from './filtering';
import { useTokenComparator } from './sorting';
import { BridgeCurrencyList } from './styled';

interface Props {
  isOpen: boolean;
  bridgeCurrencies?: BridgeCurrency[];
  onClose: () => void;
  onCurrencySelect: (currency: BridgeCurrency) => void;
  selectedCurrency?: Currency;
  otherSelectedCurrency?: Currency;
}

const SelectBridgeCurrencyDrawer: React.FC<Props> = (props) => {
  const { isOpen, onClose, onCurrencySelect, otherSelectedCurrency, selectedCurrency, bridgeCurrencies } = props;
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  const allTokens = bridgeCurrencies;
  const chainId = useChainId();

  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: BridgeCurrency[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken as Currency as BridgeCurrency] : [];
    const bridgeCurrencies = allTokens || [];
    return filterBridgeCurrencies(bridgeCurrencies, searchQuery);
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: BridgeCurrency[] = useMemo(() => {
    if (searchToken) return [searchToken as Currency as BridgeCurrency];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter((bridgeCurrency) => bridgeCurrency.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter((bridgeCurrency) => bridgeCurrency.symbol?.toLowerCase() !== symbolMatch[0]),
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator]);

  const currencies = useMemo(() => {
    if (searchQuery === '') {
      return [...filteredSortedTokens];
    }
    return filteredSortedTokens;
  }, [filteredSortedTokens, chainId]);

  const onSelect = useCallback(
    (currency: BridgeCurrency) => {
      onCurrencySelect(currency);
      onClose();
    },
    [onCurrencySelect, onClose],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const bridgeCurrency: BridgeCurrency = data?.[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, bridgeCurrency as Currency));
      const otherSelected = Boolean(
        otherSelectedCurrency && currencyEquals(otherSelectedCurrency, bridgeCurrency as Currency),
      );

      return bridgeCurrency ? (
        <BridgeCurrencyRow
          style={style}
          bridgeCurrency={bridgeCurrency}
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
    <Drawer title="Select a Currency" isOpen={isOpen} onClose={onClose}>
      {/* Render Search BridgeCurrency Input */}
      <Box padding="0px 20px">
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
      {/* Render All Selected BridgeCurrencies */}
      <BridgeCurrencyList>
        {currencies?.length > 0 && (
          <AutoSizer disableWidth>
            {({ height }) => (
              <FixedSizeList
                height={height}
                width="100%"
                itemCount={currencies?.length}
                itemSize={56}
                itemData={currencies}
                itemKey={(index, data) => data[index]?.address}
              >
                {Row}
              </FixedSizeList>
            )}
          </AutoSizer>
        )}
      </BridgeCurrencyList>
    </Drawer>
  );
};

export default memo(SelectBridgeCurrencyDrawer, (prevProps, nextProps) => {
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
