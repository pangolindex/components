import { ChainId, Token } from '@pangolindex/sdk';
import { PNG } from 'src/constants/tokens';
import { usePangolinWeb3 } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { AppState, useSelector } from '../index';

export function useSelectedCurrencyLists(): Token[] | undefined {
  const { chainId = ChainId.AVALANCHE } = usePangolinWeb3();
  const allTokens = useAllTokens();
  const coins = Object.values(allTokens || {});

  let addresses = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as string[]).concat(state?.pwatchlists?.currencies || []),
  );

  addresses = [PNG[chainId]?.address, ...addresses];

  let allSelectedToken = [] as Token[];

  addresses.forEach((address) => {
    const filterTokens = coins.filter((coin) => address.toLowerCase() === coin.address.toLowerCase());

    allSelectedToken = [...allSelectedToken, ...filterTokens];
  });

  return allSelectedToken;
}

export function useIsSelectedCurrency(address: string): boolean {
  const { chainId = ChainId.AVALANCHE } = usePangolinWeb3();

  let addresses = useSelector<AppState['pwatchlists']['currencies']>((state) =>
    ([] as string[]).concat(state?.pwatchlists?.currencies || []),
  );

  addresses = [PNG[chainId]?.address, ...addresses];

  return (addresses || []).includes(address);
}
