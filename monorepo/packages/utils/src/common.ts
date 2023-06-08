/* eslint-disable max-lines */
import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, TransactionResponse, Web3Provider } from '@ethersproject/providers';
import {
  MetamaskError,
  ROUTER_ADDRESS,
  ROUTER_DAAS_ADDRESS,
  SAR_STAKING_ADDRESS,
  ZERO_ADDRESS,
} from '@pangolindex/constants';
import IPangolinRouter from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/interfaces/IPangolinRouter.sol/IPangolinRouter.json';
import IPangolinRouterSupportingFees from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/interfaces/IPangolinRouterSupportingFees.sol/IPangolinRouterSupportingFees.json';
import {
  ALL_CHAINS,
  BridgeChain,
  BridgeCurrency,
  CAVAX,
  CHAINS,
  Chain,
  ChainId,
  Currency,
  CurrencyAmount,
  ElixirTrade,
  Fraction,
  JSBI,
  NetworkType,
  NumberType,
  Percent,
  Price,
  Token,
  TokenAmount,
  Trade,
  currencyEquals,
  formatPrice,
} from '@pangolindex/sdk';
import { Bound } from 'src/state/pmint/elixir/atom';
import { TokenAddressMap } from '../state/plists/hooks';
import { hederaFn } from './hedera';
import { wait } from './retry';

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export function isCosmosAddress(value: string | undefined, bridgeChain: BridgeChain): string | false {
  try {
    if (typeof value !== 'string' || !value) {
      return false;
    }
    const prefix = bridgeChain?.meta_data?.cosmosPrefix;
    if (prefix) {
      return value.startsWith(prefix) ? value : false;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export function isDummyAddress(value: any): string | false {
  return value;
}

export const validateAddressMapping: { [chainId in ChainId]: (value: any) => string | false } = {
  [ChainId.FUJI]: isAddress,
  [ChainId.AVALANCHE]: isAddress,
  [ChainId.WAGMI]: isAddress,
  [ChainId.COSTON]: isAddress,
  [ChainId.SONGBIRD]: isAddress,
  [ChainId.FLARE_MAINNET]: isAddress,
  [ChainId.HEDERA_TESTNET]: hederaFn.isAddressValid,
  [ChainId.HEDERA_MAINNET]: hederaFn.isAddressValid,
  [ChainId.NEAR_MAINNET]: isDummyAddress,
  [ChainId.NEAR_TESTNET]: isDummyAddress,
  [ChainId.COSTON2]: isAddress,
  [ChainId.ETHEREUM]: isDummyAddress,
  [ChainId.POLYGON]: isDummyAddress,
  [ChainId.FANTOM]: isDummyAddress,
  [ChainId.XDAI]: isDummyAddress,
  [ChainId.BSC]: isDummyAddress,
  [ChainId.ARBITRUM]: isDummyAddress,
  [ChainId.CELO]: isDummyAddress,
  [ChainId.OKXCHAIN]: isDummyAddress,
  [ChainId.VELAS]: isDummyAddress,
  [ChainId.AURORA]: isDummyAddress,
  [ChainId.CRONOS]: isDummyAddress,
  [ChainId.FUSE]: isDummyAddress,
  [ChainId.MOONRIVER]: isDummyAddress,
  [ChainId.MOONBEAM]: isDummyAddress,
  [ChainId.OP]: isDummyAddress,
  [ChainId.EVMOS_TESTNET]: isAddress,
  [ChainId.EVMOS_MAINNET]: isAddress,
};

export const checkAddressNetworkBaseMapping: {
  [networkType in NetworkType]: (value: any, bridgeChain: BridgeChain) => string | false;
} = {
  [NetworkType.EVM]: isDummyAddress,
  [NetworkType.COSMOS]: isCosmosAddress,
};

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: CHAINS[ChainId.FUJI].blockExplorerUrls?.[0] || '',
  [ChainId.AVALANCHE]: CHAINS[ChainId.AVALANCHE].blockExplorerUrls?.[0] || '',
  [ChainId.WAGMI]: CHAINS[ChainId.WAGMI].blockExplorerUrls?.[0] || '',
  [ChainId.COSTON]: CHAINS[ChainId.COSTON].blockExplorerUrls?.[0] || '',
  [ChainId.SONGBIRD]: CHAINS[ChainId.SONGBIRD].blockExplorerUrls?.[0] || '',
  [ChainId.FLARE_MAINNET]: CHAINS[ChainId.FLARE_MAINNET].blockExplorerUrls?.[0] || '',
  [ChainId.HEDERA_TESTNET]: CHAINS[ChainId.HEDERA_TESTNET].blockExplorerUrls?.[0] || '',
  [ChainId.HEDERA_MAINNET]: CHAINS[ChainId.HEDERA_MAINNET].blockExplorerUrls?.[0] || '',
  [ChainId.NEAR_MAINNET]: CHAINS[ChainId.NEAR_MAINNET].blockExplorerUrls?.[0] || '',
  [ChainId.NEAR_TESTNET]: CHAINS[ChainId.NEAR_TESTNET].blockExplorerUrls?.[0] || '',
  [ChainId.COSTON2]: CHAINS[ChainId.COSTON2].blockExplorerUrls?.[0] || '',
  [ChainId.ETHEREUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
  [ChainId.EVMOS_TESTNET]: CHAINS[ChainId.EVMOS_TESTNET].blockExplorerUrls?.[0] || '',
  [ChainId.EVMOS_MAINNET]: CHAINS[ChainId.EVMOS_MAINNET].blockExplorerUrls?.[0] || '',
};

const transactionPath: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: 'tx',
  [ChainId.AVALANCHE]: 'tx',
  [ChainId.WAGMI]: 'tx',
  [ChainId.COSTON]: 'tx',
  [ChainId.SONGBIRD]: 'tx',
  [ChainId.FLARE_MAINNET]: 'tx',
  [ChainId.HEDERA_TESTNET]: 'tx',
  [ChainId.HEDERA_MAINNET]: 'tx',
  [ChainId.NEAR_MAINNET]: 'transactions',
  [ChainId.NEAR_TESTNET]: 'transactions',
  [ChainId.COSTON2]: 'tx',
  [ChainId.ETHEREUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
  [ChainId.EVMOS_TESTNET]: 'tx',
  [ChainId.EVMOS_MAINNET]: 'tx',
};

const addressPath: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: 'address',
  [ChainId.AVALANCHE]: 'address',
  [ChainId.WAGMI]: 'address',
  [ChainId.COSTON]: 'address',
  [ChainId.SONGBIRD]: 'address',
  [ChainId.FLARE_MAINNET]: 'address',
  [ChainId.HEDERA_TESTNET]: 'address',
  [ChainId.HEDERA_MAINNET]: 'address',
  [ChainId.NEAR_MAINNET]: 'accounts',
  [ChainId.NEAR_TESTNET]: 'accounts',
  [ChainId.COSTON2]: 'address',
  [ChainId.ETHEREUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
  [ChainId.EVMOS_TESTNET]: 'address',
  [ChainId.EVMOS_MAINNET]: 'address',
};

const blockPath: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: 'block',
  [ChainId.AVALANCHE]: 'block',
  [ChainId.WAGMI]: 'block',
  [ChainId.COSTON]: 'block',
  [ChainId.SONGBIRD]: 'block',
  [ChainId.FLARE_MAINNET]: 'block',
  [ChainId.HEDERA_TESTNET]: 'block',
  [ChainId.HEDERA_MAINNET]: 'block',
  [ChainId.NEAR_MAINNET]: 'blocks',
  [ChainId.NEAR_TESTNET]: 'blocks',
  [ChainId.COSTON2]: 'block',
  [ChainId.ETHEREUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
  [ChainId.EVMOS_TESTNET]: 'block',
  [ChainId.EVMOS_MAINNET]: 'block',
};

const tokenPath: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: 'token',
  [ChainId.AVALANCHE]: 'token',
  [ChainId.WAGMI]: 'token',
  [ChainId.COSTON]: 'token',
  [ChainId.SONGBIRD]: 'token',
  [ChainId.FLARE_MAINNET]: 'token',
  [ChainId.HEDERA_TESTNET]: 'token',
  [ChainId.HEDERA_MAINNET]: 'token',
  [ChainId.NEAR_MAINNET]: 'accounts',
  [ChainId.NEAR_TESTNET]: 'accounts',
  [ChainId.COSTON2]: 'token',
  [ChainId.ETHEREUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.FANTOM]: '',
  [ChainId.XDAI]: '',
  [ChainId.BSC]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.CELO]: '',
  [ChainId.OKXCHAIN]: '',
  [ChainId.VELAS]: '',
  [ChainId.AURORA]: '',
  [ChainId.CRONOS]: '',
  [ChainId.FUSE]: '',
  [ChainId.MOONRIVER]: '',
  [ChainId.MOONBEAM]: '',
  [ChainId.OP]: '',
  [ChainId.EVMOS_TESTNET]: 'token',
  [ChainId.EVMOS_MAINNET]: 'token',
};

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  const prefix = `${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[ChainId.AVALANCHE]}`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/${transactionPath[chainId]}/${data}`;
    }
    case 'token': {
      return `${prefix}/${tokenPath[chainId]}/${data}`;
    }
    case 'block': {
      return `${prefix}/${blockPath[chainId]}/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/${addressPath[chainId]}/${data}`;
    }
  }
}

const walletProvider = () => {
  if (window.xfi && window.xfi.ethereum) {
    return window.xfi.ethereum;
  } else if (window.bitkeep && window.isBitKeep) {
    return window.bitkeep.ethereum;
  }
  return window.ethereum;
};

export async function changeNetwork(chain: Chain, action?: () => void) {
  const { ethereum } = window;

  if (ethereum) {
    try {
      await walletProvider().request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chain?.chain_id?.toString(16)}` }],
      });
      action && action();
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask.
      const metamask = error as MetamaskError;
      if (metamask.code === 4902) {
        try {
          await walletProvider().request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: chain.name,
                chainId: `0x${chain?.chain_id?.toString(16)}`,
                //nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpc_uri],
                blockExplorerUrls: chain.blockExplorerUrls,
                iconUrls: chain.logo,
                nativeCurrency: chain.nativeCurrency,
              },
            ],
          });
        } catch (_error) {
          return;
        }
      }
    }
  }
}

// compare two token amounts with highest one coming first
export function balanceComparator(balanceA?: TokenAmount, balanceB?: TokenAmount) {
  if (balanceA && balanceB) {
    return balanceA.greaterThan(balanceB) ? -1 : balanceA.equalTo(balanceB) ? 0 : 1;
  } else if (balanceA && balanceA.greaterThan('0')) {
    return -1;
  } else if (balanceB && balanceB.greaterThan('0')) {
    return 1;
  }
  return 0;
}

export function getTokenComparator(balances: {
  [tokenAddress: string]: TokenAmount | undefined;
}): (tokenA: BridgeCurrency | Token, tokenB: BridgeCurrency | Token) => number {
  return function sortTokens(tokenA: BridgeCurrency | Token, tokenB: BridgeCurrency | Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = balances[tokenA.address];
    const balanceB = balances[tokenB.address];

    const balanceComp = balanceComparator(balanceA, balanceB);
    if (balanceComp !== 0) return balanceComp;

    if (tokenA.symbol && tokenB.symbol) {
      // sort by symbol
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1;
    } else {
      return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0;
    }
  };
}

export const useInverter = ({
  priceLower,
  priceUpper,
  quote,
  base,
  invert,
}: {
  priceLower?: Price;
  priceUpper?: Price;
  quote?: Token;
  base?: Token;
  invert?: boolean;
}): {
  priceLower?: Price;
  priceUpper?: Price;
  quote?: Token;
  base?: Token;
} => {
  return {
    priceUpper: invert ? priceLower?.invert() : priceUpper,
    priceLower: invert ? priceUpper?.invert() : priceLower,
    quote: invert ? base : quote,
    base: invert ? quote : base,
  };
};

export function filterTokenOrChain(
  data: (BridgeCurrency | Token | Chain | BridgeChain)[],
  search: string,
): (BridgeCurrency | Token | Chain | BridgeChain)[] {
  if (search.length === 0) return data;
  const searchingAddress = isAddress(search);

  if (searchingAddress) {
    return (data as (BridgeCurrency | Token)[]).filter((element) => element?.address === searchingAddress);
  }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0);

  if (lowerSearchParts.length === 0) {
    return data;
  }

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);

    return lowerSearchParts.every((p) => p.length === 0 || sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p)));
  };

  return data.filter((element) => {
    const { symbol, name } = element;

    return (symbol && matchesSearch(symbol)) || (name && matchesSearch(name));
  });
}

// this mapping is useful for transforming address before displaying it on UI
// for EVM chain this is shortening the address to fit it in UI
// for Hedera chain this is converting address to Hedera Account Id
export const shortenAddressMapping: { [chainId in ChainId]: (value: any) => string | false } = {
  [ChainId.FUJI]: shortenAddress,
  [ChainId.AVALANCHE]: shortenAddress,
  [ChainId.WAGMI]: shortenAddress,
  [ChainId.COSTON]: shortenAddress,
  [ChainId.SONGBIRD]: shortenAddress,
  [ChainId.FLARE_MAINNET]: shortenAddress,
  [ChainId.HEDERA_TESTNET]: hederaFn.hederaId,
  [ChainId.HEDERA_MAINNET]: hederaFn.hederaId,
  [ChainId.NEAR_MAINNET]: shortenAddress,
  [ChainId.NEAR_TESTNET]: shortenAddress,
  [ChainId.COSTON2]: shortenAddress,
  [ChainId.ETHEREUM]: shortenAddress,
  [ChainId.POLYGON]: shortenAddress,
  [ChainId.FANTOM]: shortenAddress,
  [ChainId.XDAI]: shortenAddress,
  [ChainId.BSC]: shortenAddress,
  [ChainId.ARBITRUM]: shortenAddress,
  [ChainId.CELO]: shortenAddress,
  [ChainId.OKXCHAIN]: shortenAddress,
  [ChainId.VELAS]: shortenAddress,
  [ChainId.AURORA]: shortenAddress,
  [ChainId.CRONOS]: shortenAddress,
  [ChainId.FUSE]: shortenAddress,
  [ChainId.MOONRIVER]: shortenAddress,
  [ChainId.MOONBEAM]: shortenAddress,
  [ChainId.OP]: shortenAddress,
  [ChainId.EVMOS_TESTNET]: shortenAddress,
  [ChainId.EVMOS_MAINNET]: shortenAddress,
};

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chainId: ChainId = ChainId.AVALANCHE, chars = 4): string {
  const parsed = isEvmChain(chainId) ? isAddress(address) : address;
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars)}...${parsed.substring(parsed.length - chars)}`;
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

// it convert seconds to hours/minutes HH:MM
export function calculateTransactionTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else {
    return `${new Date(seconds * 1000).toISOString().substring(11, 16)} min`;
  }
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library?.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract | null {
  if (!isAddress(address) || address === AddressZero) {
    return null;
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any);
}

// account is optional
export function getRouterContract(chainId: ChainId, library: Web3Provider, account?: string): Contract | null {
  return getContract(ROUTER_ADDRESS[chainId], IPangolinRouter.abi, library, account);
}
export function getRouterContractDaaS(chainId: ChainId, library: Web3Provider, account?: string): Contract | null {
  return getContract(ROUTER_DAAS_ADDRESS[chainId], IPangolinRouterSupportingFees.abi, library, account);
}

export function isTokenOnList(defaultTokens: TokenAddressMap, chainId: ChainId, currency?: Currency): boolean {
  if (chainId && currency === CAVAX[chainId]) return true;
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address]);
}

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
export function tradeMeaningfullyDiffers(tradeA: Trade | ElixirTrade, tradeB: Trade | ElixirTrade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}

export function getChainByNumber(chainId: ChainId | number): Chain | undefined {
  return ALL_CHAINS.find((chain) => chain.chain_id === chainId);
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ];
}

// check if exist address of sar contract of a certain chain
export function existSarContract(chainId: ChainId) {
  return SAR_STAKING_ADDRESS[chainId] !== undefined;
}

// https://github.com/ethers-io/ethers.js/issues/945#issuecomment-1074683436
// wait for transaction confirmation or set timeout
export async function waitForTransaction(
  tx: TransactionResponse,
  confirmations?: number,
  timeout = 10000, // 10 seconds
) {
  await Promise.race([
    tx.wait(confirmations),
    (async () => {
      await wait(timeout);
    })(),
  ]);
}

export function getBuyUrl(token: Token, chainId?: ChainId): string {
  const origin = window.location.origin;
  const path = `/#/swap?inputCurrency=${chainId ? CAVAX[chainId].symbol : ZERO_ADDRESS}&outputCurrency=${
    token.address
  }`;
  return origin.includes('localhost') || origin.includes('pangolin.exchange') ? path : `app.pangolin.exchange${path}`;
}

// some browsers do not support scrollIntoView
// https://stackoverflow.com/a/50411076/18268694
export function scrollElementIntoView(element: HTMLElement | null, behavior?: 'smooth' | 'auto') {
  if (element) {
    const scrollTop = window.scrollY || element.scrollTop;

    const finalOffset = element.getBoundingClientRect().top + scrollTop;

    window.parent.scrollTo({
      top: finalOffset,
      behavior: behavior || 'auto',
    });
  }
}

export function isEvmChain(chainId: ChainId = ChainId.AVALANCHE): boolean {
  if (CHAINS[chainId]?.evm) {
    return true;
  }
  return false;
}

// http://jsfiddle.net/5QrhQ/5/
export function decimalToFraction(number: number): Fraction {
  const gcd = (a, b) => {
    if (b < 0.0000001) return a; // Since there is a limited precision we need to limit the value.

    return gcd(b, Math.floor(a % b)); // Discard any fractions due to limitations in precision.
  };

  const len = number.toString().length - 2;

  let denominator = Math.pow(10, len);
  let numerator = number * denominator;

  const divisor = gcd(numerator, denominator);

  numerator /= divisor;
  denominator /= divisor;
  return new Fraction(Math.floor(numerator).toString(), Math.floor(denominator).toString());
}

export function capitalizeWord(word = '') {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatTickPrice({
  price,
  atLimit,
  direction,
  placeholder,
  numberType,
}: {
  price: Price | undefined;
  atLimit: { [bound in Bound]?: boolean | undefined };
  direction: Bound;
  placeholder?: string;
  numberType?: NumberType;
}) {
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞';
  }

  if (!price && placeholder !== undefined) {
    return placeholder;
  }

  return formatPrice(price, numberType ?? NumberType.TokenNonTx);
}
