import { isAddress } from 'src/utils';

/**
 * Given a name or address, does a lookup to resolve to an address and name
 * @param nameOrAddress ENS name or address
 */
export function useENS(nameOrAddress?: string | null): {
  loading: boolean;
  address: string | null;
  name: string | null;
} {
  const validated = isAddress(nameOrAddress);

  return {
    loading: false,
    address: validated ? validated : null,
    name: null,
  };
}
