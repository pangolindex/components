import { CoingeckoWatchListToken } from '@pangolindex/state-hooks';
import { useAtom } from 'jotai/react';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';

export interface PortfolioState {
  watchList: CoingeckoWatchListToken[];
}

const initialState: PortfolioState = {
  watchList: [],
};

const localstorageKey = 'portfolio_pangolin';
const watchListAtom = atomWithStorage<PortfolioState>(localstorageKey, initialState);

export function usePortfolioAtom() {
  const [portfolioState, setPortfolioState] = useAtom(watchListAtom);

  const setSelectedCurrencies = useCallback(
    (currencies: CoingeckoWatchListToken[]) => {
      setPortfolioState((prev) => ({
        ...prev,
        watchList: currencies,
      }));
    },
    [setPortfolioState],
  );

  const selectedCurrencies = portfolioState.watchList;

  return {
    portfolioState,
    setPortfolioState,
    selectedCurrencies,
    setSelectedCurrencies,
  };
}

export function useWatchlist() {
  const { selectedCurrencies, setSelectedCurrencies } = usePortfolioAtom();

  const addCurrency = useCallback(
    (currency: CoingeckoWatchListToken) => {
      setSelectedCurrencies([...selectedCurrencies, currency]);
    },
    [selectedCurrencies, setSelectedCurrencies],
  );

  const removeCurrency = useCallback(
    (id: string) => {
      setSelectedCurrencies(selectedCurrencies.filter((currency) => currency.id !== id));
    },
    [setSelectedCurrencies],
  );

  const updateCurrencies = useCallback(
    (data: CoingeckoWatchListToken[]) => {
      setSelectedCurrencies(
        data.map((currency) => {
          const prevCurrency = selectedCurrencies.find((prevCurrency) => prevCurrency.id === currency.id);

          if (prevCurrency) {
            return {
              ...prevCurrency,
              price: currency.price,
              weeklyChartData: currency.weeklyChartData,
            };
          } else {
            return currency;
          }
        }),
      );
    },
    [setSelectedCurrencies],
  );

  return { selectedCurrencies, addCurrency, removeCurrency, updateCurrencies };
}
