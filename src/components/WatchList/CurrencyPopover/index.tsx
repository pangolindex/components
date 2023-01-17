import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, TextInput } from 'src/components';
import { MixPanelEvents, useMixpanel } from 'src/hooks/mixpanel';
import useDebounce from 'src/hooks/useDebounce';
import usePrevious from 'src/hooks/usePrevious';
import { AppState, useDispatch, useSelector } from 'src/state';
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
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastOpen = usePrevious(isOpen);

  const allWatchlistCurrencies = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as CoingeckoWatchListToken[]).concat(state?.pwatchlists?.currencies || []),
  );

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

  const filteredTokens = useCoinGeckoSearchTokens(debouncedSearchQuery);

  const currencies = Object.values(filteredTokens || {}).length > 0 ? Object.values(filteredTokens || {}) : coins;

  const dispatch = useDispatch();

  const mixpanel = useMixpanel();

  const onCurrencySelection = useCallback(
    (currency: CoingeckoWatchListToken) => {
      dispatch(addCurrency(currency));
    },
    [dispatch],
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
        {currencies.map((item) => (
          <div style={{ height: 45 }} key={item.id}>
            <CurrencyRow
              key={item?.id}
              style={{}}
              currency={item}
              isSelected={allWatchlistCurrencies.find(({ id }) => id === item?.id) ? true : false}
              onSelect={(address) => {
                onSelectCurrency(item);
                onCurrencySelection(item);
                mixpanel.track(MixPanelEvents.ADD_WATCHLIST, {
                  token: item.symbol,
                  tokenAddress: address,
                });
              }}
            />
          </div>
        ))}
      </CurrencyList>
    </PopoverContainer>
  );
};
export default CurrencyPopover;
