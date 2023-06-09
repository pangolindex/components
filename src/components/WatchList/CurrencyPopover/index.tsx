import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FixedSizeList } from 'react-window';
import { Box, TextInput } from 'src/components';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import useDebounce from 'src/hooks/useDebounce';
import usePrevious from 'src/hooks/usePrevious';
import { CoingeckoWatchListState } from 'src/state/pcoingecko/atom';
import { CoingeckoWatchListToken, useCoinGeckoSearchTokens } from 'src/state/pcoingecko/hooks';
import { useWatchlist } from 'src/state/pwatchlists/atom';
import CurrencyRow from './CurrencyRow';
import { AddInputWrapper, CurrencyList, PopoverContainer } from './styled';

interface Props {
  getRef?: (ref: any) => void;
  coins: CoingeckoWatchListState;
  isOpen: boolean;
  onSelectCurrency: (currency: CoingeckoWatchListToken) => void;
}

const CurrencyPopover: React.FC<Props> = ({
  getRef = () => {
    /* */
  },
  coins,
  isOpen,
  onSelectCurrency,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { selectedCurrencies: allWatchlistCurrencies, addCurrency } = useWatchlist();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastOpen = usePrevious(isOpen);
  const { t } = useTranslation();

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

  // fetch currencies if only typed a text
  const searchCurrencies = useCoinGeckoSearchTokens(debouncedSearchQuery.length >= 0 ? debouncedSearchQuery : '');

  const currencies = useMemo(() => {
    const searchCoins = Object.assign(coins, searchCurrencies);
    return Object.values(searchCoins).filter((coin) =>
      coin.symbol.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );
  }, [coins, searchCurrencies, debouncedSearchQuery]);

  const mixpanel = useMixpanel();

  const onCurrencySelection = useCallback(
    (currency: CoingeckoWatchListToken) => {
      addCurrency(currency);
    },
    [addCurrency],
  );

  const Row = useCallback(
    ({ data, index, style }: { data: CoingeckoWatchListToken[]; index: number; style: any }) => {
      const item: CoingeckoWatchListToken = data?.[index];
      const isSelected = allWatchlistCurrencies.find(({ id }) => id === item?.id) ? true : false;

      return (
        <CurrencyRow
          key={item?.id}
          style={style}
          currency={item}
          isSelected={isSelected}
          onSelect={(address) => {
            onSelectCurrency(item);
            onCurrencySelection(item);
            mixpanel.track(MixPanelEvents.ADD_WATCHLIST, {
              token: item.symbol,
              tokenAddress: address,
            });
          }}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allWatchlistCurrencies, mixpanel, onSelectCurrency, onCurrencySelection],
  );

  return (
    <PopoverContainer ref={(ref: any) => getRef(ref)}>
      {/* Render Search Token Input */}
      <Box padding="0px 10px">
        <AddInputWrapper>
          <TextInput
            placeholder={t('common.search')}
            onChange={(value: any) => {
              setSearchQuery(value as string);
            }}
            getRef={(ref: HTMLInputElement) => ((inputRef as any).current = ref)}
          />
        </AddInputWrapper>
      </Box>

      <CurrencyList>
        <FixedSizeList
          height={135}
          width="100%"
          itemCount={currencies.length}
          itemSize={56}
          itemData={currencies}
          itemKey={(index, data) => data[index].id}
        >
          {Row}
        </FixedSizeList>
      </CurrencyList>
    </PopoverContainer>
  );
};
export default CurrencyPopover;
