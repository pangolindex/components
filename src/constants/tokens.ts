import { CHAINS, ChainId, Token } from '@pangolindex/sdk';

export const PNG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    CHAINS[ChainId.FUJI].contracts!.png,
    18,
    CHAINS[ChainId.FUJI].png_symbol,
    'Pangolin',
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    CHAINS[ChainId.AVALANCHE].contracts!.png,
    18,
    CHAINS[ChainId.AVALANCHE].png_symbol,
    'Pangolin',
  ),
  [ChainId.WAGMI]: new Token(
    ChainId.WAGMI,
    CHAINS[ChainId.WAGMI].contracts!.png,
    18,
    CHAINS[ChainId.WAGMI].png_symbol,
    'Wagmi Pangolin',
  ),
  [ChainId.COSTON]: new Token(
    ChainId.COSTON,
    CHAINS[ChainId.COSTON].contracts!.png,
    18,
    CHAINS[ChainId.COSTON].png_symbol,
    'Wagmi Pangolin',
  ),
};
