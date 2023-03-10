import { CAVAX, Currency } from '@pangolindex/sdk';
import { useChainId } from 'src/hooks';
import { useTokenHook } from 'src/hooks/tokens';

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const chainId = useChainId();
  const isAVAX = currencyId?.toUpperCase() === CAVAX[chainId].symbol?.toUpperCase();
  const useToken_ = useTokenHook[chainId];
  const token = useToken_(isAVAX ? undefined : currencyId);
  return isAVAX ? chainId && CAVAX[chainId] : token;
}
