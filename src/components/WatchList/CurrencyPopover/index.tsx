import { CAVAX, ChainId, Currency, Token, WAVAX } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { Box, TextInput } from 'src/components';
import { filterTokens } from 'src/components/SearchModal/filtering';
import { useTokenComparator } from 'src/components/SearchModal/sorting';
import { useChainId } from 'src/hooks';
import { useToken } from 'src/hooks/Tokens';
import usePrevious from 'src/hooks/usePrevious';
import { useDispatch } from 'src/state';
import { addCurrency } from 'src/state/pwatchlists/actions';
import { isAddress } from 'src/utils';
import CurrencyRow from './CurrencyRow';
import { AddInputWrapper, CurrencyList, PopoverContainer } from './styled';

interface Props {
  getRef?: (ref: any) => void;
  coins: Array<Token>;
  isOpen: boolean;
  onSelectCurrency: (currency: Token) => void;
}

const currencyKey = (currency: Currency, chainId: ChainId): string => {
  return currency instanceof Token
    ? currency.address
    : currency === CAVAX[chainId] && CAVAX[chainId]?.symbol
    ? (CAVAX[chainId]?.symbol as string)
    : '';
};

const CurrencyPopover: React.FC<Props> = ({
  getRef = () => {
    /* */
  },
  coins,
  isOpen,
  onSelectCurrency,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [invertSearchOrder] = useState<boolean>(false);
  const chainId = useChainId();
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

  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  const tokenComparator = useTokenComparator(invertSearchOrder, [WAVAX[chainId]]);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    return filterTokens(Object.values(coins), searchQuery);
  }, [isAddressSearch, searchToken, coins, searchQuery]);

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

  const currencies = filteredSortedTokens;

  const dispatch = useDispatch();

  const onCurrencySelection = useCallback(
    (address: string) => {
      dispatch(addCurrency(address));
    },
    [dispatch],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Token = data?.[index];

      return currency ? (
        <CurrencyRow
          key={index}
          style={style}
          currency={currency}
          onSelect={(address) => {
            onSelectCurrency(currency);
            onCurrencySelection(address);
          }}
        />
      ) : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <PopoverContainer ref={(ref: any) => getRef(ref)}>
      {/* Render Search Token Input */}
      <Box padding="0px 10px">
        <AddInputWrapper>
          <TextInput
            placeholder="Search"
            onChange={(value: any) => {
              setSearchQuery(value as string);
            }}
            value={searchQuery}
            getRef={(ref: HTMLInputElement) => ((inputRef as any).current = ref)}
          />
        </AddInputWrapper>
      </Box>

      <CurrencyList>
        <AutoSizer disableWidth>
          {({ height }) => (
            <FixedSizeList
              height={height}
              width="100%"
              itemCount={currencies.length}
              itemSize={45}
              itemData={currencies}
              itemKey={(index, data) => currencyKey(data[index], chainId)}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </CurrencyList>
    </PopoverContainer>
  );
};
export default CurrencyPopover;
