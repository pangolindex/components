import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import { useQuery } from 'react-query';
import { NEWS_API_URL } from 'src/constants';
import { useChainId } from 'src/hooks';

const news_api_key = process.env.VITE_NEWS_KEY;

export interface News {
  id: number;
  title: string;
  article: string;
  network_id: number | null;
}

const GET_NEWS = gql`
  query News {
    pangolin_news(order_by: { id: desc }) {
      article
      id
      network_id
      title
    }
  }
`;

const gqlClient = new GraphQLClient(NEWS_API_URL, {
  headers: {
    'x-hasura-admin-secret': news_api_key ?? '',
  },
});

export function useGetNews() {
  const chainId = useChainId();

  return useQuery(
    ['getNews', chainId],
    async () => {
      if (!news_api_key) return;

      const data = await gqlClient.request<{ pangolin_news: News[] }>(GET_NEWS);

      const news = data?.pangolin_news;

      return news.filter((element) => element.network_id === chainId || element.network_id === null);
    },
    {
      cacheTime: 60 * 60 * 1000, // 1 hour
      refetchInterval: 60 * 10 * 1000, // 10 minutes
    },
  );
}
