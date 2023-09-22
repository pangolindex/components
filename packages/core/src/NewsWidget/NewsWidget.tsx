import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import NewsSection from './NewsSection';
import { NewsProps } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

export default function NewsWidget({ boxHeight = '400px' }: NewsProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <NewsSection boxHeight={boxHeight} />
    </QueryClientProvider>
  );
}
