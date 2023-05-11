import { AVALANCHE_MAINNET } from '@pangolindex/sdk';
import axios from 'axios';
import qs from 'qs';
import { useQuery } from 'react-query';
import { DIRECTUS_URL_NEWS } from 'src/constants';
import { useChainId } from 'src/hooks';
import { getChainByNumber } from 'src/utils';

export interface News {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  chains: string[];
}

// Get News in Pangolin Strapi api
export function useGetNews() {
  const chainId = useChainId();
  const chain = getChainByNumber(chainId) ?? AVALANCHE_MAINNET;

  const query = qs.stringify(
    {
      sort: ['-date_created'],
      filter: {
        status: {
          _eq: 'published',
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  return useQuery(
    ['getNews', chain.id],
    async () => {
      const response = await axios.get(`${DIRECTUS_URL_NEWS}/items/news?${query}`, {
        timeout: 60000,
      });
      const data = response.data;
      const news: News[] = data?.data?.map((element: any) => {
        return {
          id: element?.id,
          title: element?.title,
          content: element?.content,
          createdAt: new Date(element?.date_created),
          updatedAt: !element?.date_updated ? null : new Date(element?.date_updated),
          chains: element?.chain,
        } as News;
      });

      return news.filter(
        (element) => element.chains.includes(chain.symbol.toLocaleUpperCase()) || element.chains.includes('all'),
      );
    },
    {
      cacheTime: 60 * 60 * 1000, // 1 hour
      refetchInterval: 60 * 10 * 1000, // 10 minutes
    },
  );
}
