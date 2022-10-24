import { BridgeCurrency } from '@pangolindex/sdk';
import { isAddress } from 'src/utils';

export function filterBridgeCurrencies(bridgeCurrencies: BridgeCurrency[], search: string): BridgeCurrency[] {
  if (search.length === 0) return bridgeCurrencies;

  // TODO: Will be so many address format. Need to check all of them. BTC etc... non-evm
  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    return bridgeCurrencies.filter((currency) => currency.address === searchingAddress);
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return bridgeCurrencies;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);

    return lowerSearchParts.every((p) => p.length === 0 || sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p)));
  };

  return bridgeCurrencies.filter((token) => {
    const { symbol, name } = token;

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  });
}
