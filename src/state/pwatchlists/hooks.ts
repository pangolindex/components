import { CoingeckoWatchListToken, useCoinGeckoTokens } from 'src/state/pcoingecko/hooks';
import { AppState, useSelector } from '../index';

export function useSelectedCurrencyLists(): CoingeckoWatchListToken[] | undefined {
  const allTokens = useCoinGeckoTokens();
  const coins = Object.values(allTokens || {});

  let allcurrencies = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as CoingeckoWatchListToken[]).concat(state?.pwatchlists?.currencies || []),
  );

  allcurrencies = coins?.[0] ? [coins?.[0], ...allcurrencies] : ([] as CoingeckoWatchListToken[]);

  //let allSelectedToken = [] as CoingeckoWatchListToken[];

  // allcurrencies.forEach((c) => {
  //   const filterTokens = coins.filter((coin) => c?.id?.toLowerCase() === coin?.id?.toLowerCase());

  //   allSelectedToken = [...allSelectedToken, ...filterTokens];
  // });

  return allcurrencies;
}

export function useIsSelectedCurrency(id: string): boolean {
  const allTokens = useCoinGeckoTokens();
  const coins = Object.values(allTokens || {});
  let allSelectedToken = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as CoingeckoWatchListToken[]).concat(state?.pwatchlists?.currencies || []),
  );

  allSelectedToken = [coins?.[0], ...allSelectedToken];

  const index = allSelectedToken.findIndex((x) => x?.id === id);

  return index !== -1 ? true : false;
}
