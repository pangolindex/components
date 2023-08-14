import { ChainId, Token } from '@pangolindex/sdk';
import { Tags, TokenInfo } from '@pangolindex/token-lists';

type TagDetails = Tags[keyof Tags];
export interface TagInfo extends TagDetails {
  id: string;
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo;
  public readonly tags: TagInfo[];
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name);
    this.tokenInfo = tokenInfo;
    this.tags = tags;
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }
}

export type TokenAddressMap = Readonly<{
  [chainId in ChainId]: Readonly<{ [tokenAddress: string]: WrappedTokenInfo }>;
}>;

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

/* Pair */
export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export enum PoolType {
  SIMPLE_POOL = 'SIMPLE_POOL',
  STABLE_SWAP = 'STABLE_SWAP',
  RATED_SWAP = 'RATED_SWAP',
}
