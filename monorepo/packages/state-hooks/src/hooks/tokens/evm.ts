import { parseBytes32String } from '@ethersproject/strings';
import { Token } from '@pangolindex/sdk';
import {
  ERC20_BYTES32_INTERFACE,
  ERC20_INTERFACE,
  isAddress,
  useBytes32TokenContract,
  useChainId,
  useTokenContract,
} from '@honeycomb/shared';
import { useMemo } from 'react';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from 'src/state/multicall/hooks';
import { useAllTokens } from '../useAllTokens';
import { TokenReturnType } from './constant';

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): TokenReturnType {
  const chainId = useChainId();

  const tokens = useAllTokens();

  const address = isAddress(tokenAddress);

  const tokenContract = useTokenContract(address ? address : undefined, false);
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false);
  const token: Token | undefined = address ? tokens[address] : undefined;

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD);
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD);
  const symbolBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return undefined;
    if (decimals.loading || symbol.loading || tokenName.loading) return null;
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token'),
      );
    }
    return undefined;
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ]);
}

export function useTokensContract(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const tokensName = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'name', undefined, NEVER_RELOAD);
  const tokensNameBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbols = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'symbol', undefined, NEVER_RELOAD);
  const symbolsBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!chainId) return [];

    return tokensAddress.reduce<Token[]>((acc, tokenAddress, index) => {
      const tokenName = tokensName?.[index];
      const tokenNameBytes32 = tokensNameBytes32?.[index];
      const symbol = symbols?.[index];
      const symbolBytes32 = symbolsBytes32?.[index];
      const decimal = decimals?.[index];
      const address = isAddress(tokenAddress);

      if (!!address && tokens[address]) {
        // if we have user tokens already
        acc.push(tokens[address]);
      } else if (
        tokenName?.loading === false &&
        tokenNameBytes32?.loading === false &&
        symbol?.loading === false &&
        symbolBytes32?.loading === false &&
        decimal?.loading === false &&
        address &&
        (decimal?.result?.[0] || decimal?.result?.[0] === 0)
      ) {
        const token = new Token(
          chainId,
          address,
          decimal?.result?.[0],
          parseStringOrBytes32(symbol?.result?.[0], symbolBytes32?.result?.[0], 'UNKNOWN'),
          parseStringOrBytes32(tokenName?.result?.[0], tokenNameBytes32?.result?.[0], 'Unknown Token'),
        );

        acc.push(token);
      }

      return acc;
    }, []);
  }, [chainId, decimals, symbols, symbolsBytes32, tokensName, tokensNameBytes32, tokens, tokensAddress]);
}
