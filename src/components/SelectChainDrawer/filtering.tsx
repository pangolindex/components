import { Chain } from '@pangolindex/sdk';

export function filterChains(chains: Chain[], search: string): Chain[] {
  if (search.length === 0) return chains;

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return chains;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);

    return lowerSearchParts.every((p) => p.length === 0 || sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p)));
  };

  return chains.filter((chain) => {
    const { symbol, name } = chain;

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  });
}
