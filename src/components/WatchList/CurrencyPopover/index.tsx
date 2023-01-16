import React, { useCallback, useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { Box, TextInput } from 'src/components';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import usePrevious from 'src/hooks/usePrevious';
import { useDispatch } from 'src/state';
import { CoingeckoWatchListToken, useCoinGeckoSearchTokens } from 'src/state/pcoingecko/hooks';
import { addCurrency } from 'src/state/pwatchlists/actions';
import CurrencyRow from './CurrencyRow';
import { AddInputWrapper, CurrencyList, PopoverContainer } from './styled';

interface Props {
  getRef?: (ref: any) => void;
  coins: Array<CoingeckoWatchListToken>;
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

  const filteredTokens = useCoinGeckoSearchTokens(searchQuery);

  const currencies = Object.values(filteredTokens || {}).length > 0 ? Object.values(filteredTokens || {}) : coins;

  const dispatch = useDispatch();

  const mixpanel = useMixpanel();

  const onCurrencySelection = useCallback(
    (currency: CoingeckoWatchListToken) => {
      dispatch(addCurrency(currency));
    },
    [dispatch],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: CoingeckoWatchListToken = data?.[index];

      return currency ? (
        <CurrencyRow
          key={index}
          style={style}
          currency={currency}
          onSelect={(address) => {
            onSelectCurrency(currency);
            onCurrencySelection(currency);
            mixpanel.track(MixPanelEvents.ADD_WATCHLIST, {
              token: currency.symbol,
              tokenAddress: address,
            });
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
              itemKey={(index, data) => data[index]?.id}
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
