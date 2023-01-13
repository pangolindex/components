import { ChainId, Token } from '@pangolindex/sdk';
import { PNG } from 'src/constants/tokens';
import { usePangolinWeb3 } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { useCoinGeckoTokens, CoingeckoWatchListToken } from 'src/hooks/Coingecko';
import { AppState, useSelector } from '../index';

export function useSelectedCurrencyLists(): CoingeckoWatchListToken[] | undefined {
  const { chainId = ChainId.AVALANCHE } = usePangolinWeb3();
  const allTokens = useCoinGeckoTokens();
  const coins = Object.values(allTokens || {});

  let ids = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as string[]).concat(state?.pwatchlists?.currencies || []),
  );

  ids = [coins?.[0]?.id, ...ids];

  let allSelectedToken = [] as CoingeckoWatchListToken[];

  ids.forEach((id) => {
    const filterTokens = coins.filter((coin) => id.toLowerCase() === coin?.id?.toLowerCase());

    allSelectedToken = [...allSelectedToken, ...filterTokens];
  });

  return allSelectedToken;
}

export function useIsSelectedCurrency(id: string): boolean {

  const allTokens = useCoinGeckoTokens();
  const coins = Object.values(allTokens || {});
  let ids = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as string[]).concat(state?.pwatchlists?.currencies || []),
  );

  ids = [coins?.[0]?.id, ...ids];

  return (ids || []).includes(id);
}
