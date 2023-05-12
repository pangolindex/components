import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import NewsSection from './NewsSection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

export default function NewsWidget() {
  console.log('test');
  return (
    <QueryClientProvider client={queryClient}>
      <NewsSection />
    </QueryClientProvider>
  );
}
