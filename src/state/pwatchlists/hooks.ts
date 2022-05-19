import { ChainId, Token } from '@pangolindex/sdk';
import { useSelector } from 'react-redux';
import { PNG } from 'src/constants/tokens';
import { useActiveWeb3React } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { AppState } from '../index';

export function useSelectedCurrencyLists(): Token[] | undefined {
  const { chainId = ChainId.AVALANCHE } = useActiveWeb3React();
  const allTokens = useAllTokens();
  const coins = Object.values(allTokens || {});

  let addresses = useSelector<AppState, AppState['pwatchlists']['currencies']>((state) =>
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
  const { chainId = ChainId.AVALANCHE } = useActiveWeb3React();

  let addresses = useSelector<AppState, AppState['pwatchlists']['currencies']>((state) =>
    ([] as string[]).concat(state?.pwatchlists?.currencies || []),
  );

  addresses = [PNG[chainId]?.address, ...addresses];

  return (addresses || []).includes(address);
}
