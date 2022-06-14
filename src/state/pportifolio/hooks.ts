import { ALL_CHAINS } from '@pangolindex/sdk';
import axios from 'axios';
import qs from 'qs';
import { useQuery } from 'react-query';
import { OPEN_API_DEBANK } from 'src/constants';
import { usePangolinWeb3 } from 'src/hooks';

const openApi = axios.create({
  baseURL: OPEN_API_DEBANK,
  timeout: 2000,
});

export interface Balances {
  total: number;
  chains: {
    chainID: number;
    balance: number;
  }[];
}

// Get the USD balance of address of all chains (supported by Debank)
export function useGetChainsBalances() {
  const { account } = usePangolinWeb3();

  const query = qs.stringify(
    {
      id: account,
    },
    {
      encodeValuesOnly: true,
    },
  );

  return useQuery(
    ['getChainsBalances', account],
    async () => {
      if (account) {
        const response = await openApi.get(`/total_balance?${query}`);
        const data = response.data;
        const chainbalances: Balances = {
          total: data?.total_usd_value,
          chains: [],
        };
        data?.chain_list?.forEach((chain: any) => {
          const _chain = ALL_CHAINS.filter((value) => value.chain_id === chain?.community_id)[0];
          if (_chain) {
            chainbalances.chains.push({
              chainID: chain?.community_id,
              balance: chain?.usd_value,
            });
          }
        });
        return chainbalances;
      }

      return null;
    },
    { refetchOnWindowFocus: false },
  );
}
