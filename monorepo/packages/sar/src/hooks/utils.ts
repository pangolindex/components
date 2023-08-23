/* eslint-disable max-lines */
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import {
  PNG,
  SAR_STAKING_ADDRESS,
  ZERO_ADDRESS,
  maxAmountSpend,
  tryParseAmount,
  useChainId,
  useContract,
  useMixpanel,
  usePangolinWeb3,
  useTranslation,
} from '@pangolindex/shared';
import {
  useApproveCallbackHook,
  useTokenBalancesHook,
  useTransactionAdder,
  useUSDCPriceHook,
} from '@pangolindex/state-hooks';
import { Hedera, hederaFn } from '@pangolindex/wallet-connectors';
import numeral from 'numeral';
import { useCallback, useState } from 'react';
import SarStaking from 'src/constants/abis/sar.json';
import { Position, URI } from './types';

export function useSarStakingContract() {
  const chainId = useChainId();
  return useContract(SAR_STAKING_ADDRESS[chainId], SarStaking, true);
}

// this is designed for Hedera
export function useHederaSarNFTContract() {
  const chainId = useChainId();
  const sarContractAddress = SAR_STAKING_ADDRESS[chainId];

  let nftTokenAddress: string | undefined = undefined;

  if (sarContractAddress && Hedera.isHederaChain(chainId)) {
    const sarContractId = hederaFn.hederaId(sarContractAddress ?? '');
    const nftTokenId = hederaFn.contractToTokenId(sarContractId);
    nftTokenAddress = hederaFn.idToAddress(nftTokenId);
  }

  return useContract(nftTokenAddress, SarStaking, true);
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken, chainId);
  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = t('stakeHooks.connectWallet');
  }
  if (parsedInput && !parsedAmount) {
    error = error ?? t('stakeHooks.insufficientBalance', { symbol: stakingToken.symbol });
  }
  if (!parsedAmount) {
    error = error ?? t('stakeHooks.enterAmount');
  }

  return {
    parsedAmount,
    error,
  };
}

/**
 *
 * @returns Returns the defaults functions used for all sar stake hooks
 */
export function useDefaultSarStake() {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(4);
  const [stakeError, setStakeError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const sarStakingContract = useSarStakingContract();

  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();

  const png = PNG[chainId];

  const useTokensBalance = useTokenBalancesHook[chainId];
  const [tokenBalance] = useTokensBalance(account ?? ZERO_ADDRESS, [png]);
  const userPngBalance = tokenBalance[png.address];

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, userPngBalance);

  const useUSDCPrice = useUSDCPriceHook[chainId];
  const usdcPrice = useUSDCPrice(png);
  const dollerWorth =
    userPngBalance?.greaterThan('0') && usdcPrice && usdcPrice?.greaterThan('0')
      ? Number(typedValue) * Number(usdcPrice.toFixed())
      : undefined;

  const wrappedOnDismiss = useCallback(() => {
    setStakeError(null);
    setTypedValue('');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, png, userPngBalance);

  const mixpanel = useMixpanel();

  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
  }, []);

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
    setStepIndex(4);
  }, [maxAmountInput, onUserInput]);

  const onChangePercentage = (value: number) => {
    if (!userPngBalance) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue((userPngBalance as TokenAmount).toExact());
    } else if (value === 0) {
      setTypedValue('0');
    } else {
      const newAmount = (userPngBalance as TokenAmount)
        .multiply(JSBI.BigInt(value))
        .divide(JSBI.BigInt(100)) as TokenAmount;

      setTypedValue(newAmount.toSignificant(6));
    }
  };

  const useApproveCallback = useApproveCallbackHook[chainId];
  const [approval, approveCallback] = useApproveCallback(chainId, parsedAmount, sarStakingContract?.address);

  return {
    account,
    approval,
    approveCallback,
    chainId,
    png,
    attempting,
    setAttempting,
    hash,
    setHash,
    typedValue,
    stepIndex,
    setStepIndex,
    stakeError,
    setStakeError,
    sarStakingContract,
    addTransaction,
    t,
    dollerWorth,
    wrappedOnDismiss,
    mixpanel,
    parsedAmount,
    error,
    handleMax,
    onChangePercentage,
    onUserInput,
  };
}

/**
 * Format the onchain data for all useSarPositions hooks
 * @param nftsURIs Array of the nft URI
 * @param nftsIndexes Array of array of the nft id `[[0x1], [0x2], [0x3]...]`
 * @param valuesVariables The array of call values variables of each position
 * @param rewardRates The array with reward rate of each position
 * @param pendingsRewards The array with pending rewards amount of each position
 * @param lastUpdates The array with last update time of each position
 * @param blockTimestamp The timestamp of the last block
 * @param chainId Chain id
 * @returns Returns the Array of Positions
 */
export function formatPosition(args: {
  nftsURIs: (URI | undefined)[];
  nftsIndexes: string[][];
  valuesVariables: { balance: BigNumber; sumOfEntryTimes: BigNumber }[];
  rewardRates: BigNumber[];
  pendingsRewards: BigNumber[];
  lastUpdates: BigNumber[];
  blockTimestamp: number;
  chainId: ChainId;
}) {
  const { nftsURIs, nftsIndexes, valuesVariables, rewardRates, pendingsRewards, lastUpdates, blockTimestamp, chainId } =
    args;

  const positions: (Position | undefined)[] = nftsURIs.map((uri, index) => {
    const valueVariables: { balance: BigNumber; sumOfEntryTimes: BigNumber } | undefined = valuesVariables[index];
    const rewardRate = rewardRates[index];
    const pendingRewards = pendingsRewards[index];
    const lastUpdate = lastUpdates[index];
    const id = nftsIndexes[index][0];
    const balance = valueVariables?.balance ?? BigNumber.from(0);
    const apr = rewardRate
      ?.mul(86400)
      .mul(365)
      .mul(100)
      .div(balance.isZero() ? 1 : balance);

    if (!valueVariables || !rewardRate || !pendingRewards) {
      return undefined;
    }

    const _uri =
      uri ?? createURI(balance, valueVariables.sumOfEntryTimes, apr, pendingRewards, id, blockTimestamp, chainId);

    return {
      id: BigNumber.from(id),
      balance: valueVariables?.balance,
      sumOfEntryTimes: valueVariables?.sumOfEntryTimes,
      apr: apr,
      rewardRate: rewardRate,
      uri: _uri,
      pendingRewards: pendingRewards,
      lastUpdate: lastUpdate,
    } as Position;
  });
  // remove the empty positions
  return positions.filter((position) => !!position) as Position[];
}

export function useUnstakeParseAmount(typedValue: string, stakingToken: Token, userLiquidityStaked?: TokenAmount) {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();

  const parsedInput = tryParseAmount(typedValue, stakingToken, chainId);
  const parsedAmount =
    parsedInput && userLiquidityStaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityStaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = t('stakeHooks.connectWallet');
  }
  if (parsedInput && !parsedAmount) {
    error = error ?? t('stakeHooks.insufficientBalance', { symbol: stakingToken.symbol });
  }
  if (!parsedAmount) {
    error = error ?? t('stakeHooks.enterAmount');
  }

  return {
    parsedAmount,
    error,
  };
}

/**
 *
 * @param position The position
 * @returns  Returns the defaults functions used for all sar unstake hooks
 */
export function useDefaultSarUnstake(position: Position | null) {
  const [typedValue, setTypedValue] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [unstakeError, setUnstakeError] = useState<string | null>(null);

  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const png = PNG[chainId];

  const sarStakingContract = useSarStakingContract();

  const stakedAmount = new TokenAmount(png, (position?.balance ?? 0).toString());

  const { parsedAmount, error } = useUnstakeParseAmount(typedValue, png, stakedAmount);

  // used for max input button
  const maxAmountInput = maxAmountSpend(chainId, stakedAmount);

  const wrappedOnDismiss = useCallback(() => {
    setUnstakeError(null);
    setTypedValue('');
    setStepIndex(0);
    setHash(null);
    setAttempting(false);
  }, []);

  const onUserInput = useCallback((_typedValue: string) => {
    setTypedValue(_typedValue);
  }, []);

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
    setStepIndex(4);
  }, [maxAmountInput, onUserInput]);

  const onChangePercentage = (value: number) => {
    if (stakedAmount.lessThan('0')) {
      setTypedValue('0');
      return;
    }
    if (value === 100) {
      setTypedValue(stakedAmount.toExact());
    } else if (value === 0) {
      setTypedValue('0');
    } else {
      const newAmount = stakedAmount.multiply(JSBI.BigInt(value)).divide(JSBI.BigInt(100)) as TokenAmount;

      setTypedValue(newAmount.toSignificant(6));
    }
  };

  return {
    typedValue,
    stepIndex,
    chainId,
    setStepIndex,
    unstakeError,
    setUnstakeError,
    attempting,
    setAttempting,
    hash,
    setHash,
    account,
    t,
    addTransaction,
    png,
    sarStakingContract,
    parsedAmount,
    error,
    wrappedOnDismiss,
    onUserInput,
    handleMax,
    onChangePercentage,
  };
}

/**
 *
 * @returns Returns the defaults functions used for all sar claim and compound hooks
 */
export function useDefaultSarClaimOrCompound() {
  const [attempting, setAttempting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [functionError, setFunctionError] = useState<string | null>(null);

  const { account } = usePangolinWeb3();

  const sarStakingContract = useSarStakingContract();

  const { t } = useTranslation();
  const addTransaction = useTransactionAdder();

  const wrappedOnDismiss = useCallback(() => {
    setFunctionError(null);
    setHash(null);
    setAttempting(false);
  }, []);

  return {
    attempting,
    setAttempting,
    hash,
    setHash,
    functionError,
    setFunctionError,
    account,
    sarStakingContract,
    t,
    addTransaction,
    wrappedOnDismiss,
  };
}

/**
 * This function replicate the on chain code to create the nft image, some chains need to do this
 *
 * source code: https://github.com/pangolindex/exchange-contracts/blob/1433538839858c4ab222bed1691e90861d90b46b/contracts/staking-positions/TokenMetadata.sol#L89-L162
 * @param balance Amount of PNG/PSB/PFL/PBAR... staked in this position
 * @param sumOfEntryTimes This is provide by the smart contract
 * @param apr The position apr
 * @param pendingRewards Amount of rewards to claim in position
 * @param blockTimestamp The last block timestamp in seconds
 * @param chainId Chain id
 * @returns the nft URI similar to on chain
 */
export function createURI(
  balance: BigNumber,
  sumOfEntryTimes: BigNumber,
  apr: BigNumber,
  pendingRewards: BigNumber,
  positionId: string,
  blockTimestamp: number,
  chainId: ChainId,
) {
  const exponents = [0, 2_718, 7_389, 20_086, 54_598, 148_413, 403_429, 1096_633, 2980_958, 8103_084];
  const DENOMINATOR = 1_00;

  const entryTime = balance.isZero() ? BigNumber.from(blockTimestamp) : sumOfEntryTimes.div(balance);

  function getExponent(value: number, multiplier: number) {
    if (value * DENOMINATOR >= exponents[9] * multiplier) return 9;
    if (value * DENOMINATOR >= exponents[8] * multiplier) return 8;
    if (value * DENOMINATOR >= exponents[7] * multiplier) return 7;
    if (value * DENOMINATOR >= exponents[6] * multiplier) return 6;
    if (value * DENOMINATOR >= exponents[5] * multiplier) return 5;
    if (value * DENOMINATOR >= exponents[4] * multiplier) return 4;
    if (value * DENOMINATOR >= exponents[3] * multiplier) return 3;
    if (value * DENOMINATOR >= exponents[2] * multiplier) return 2;
    if (value * DENOMINATOR >= exponents[1] * multiplier) return 1;
    return 0;
  }

  const png = PNG[chainId];
  const balanceLevel = getExponent(balance.toNumber(), 404);
  const durationLevel = getExponent(BigNumber.from(blockTimestamp).sub(entryTime).toNumber(), 9600); // 2 hours and 40 minutes

  const imageUrl = `https://static.pangolin.exchange/panguardian/${balanceLevel}${durationLevel}.png`;

  const imageStr = `<svg width="663" height="1080" viewbox="0 0 663 1080" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> 
<style type="text/css"> @font-face { font-family: "Poppins"; src: url(https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2) 
format("woff2"); } @font-face { font-family: "Poppins"; font-weight: bold; src: url(https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2) 
format("woff2"); } text { color:#1a1a1a; font-family:Poppins, sans-serif; font-size:24.73px; } .data_span { font-weight:bold; font-size:37.09px } .text_bottom .info_span { font-size: 28.81px } .text_bottom .data_span { font-size: 43.21px } </style> 
<image preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xlink:href="${imageUrl}"S></image>
<text x="27.3" y="54.9" text-anchor="start" class="text_top"><tspan class="info_span">&#36;${
    png.symbol
  }</tspan><tspan class="data_span">
${numeral(formatUnits(balance, png.decimals)).format('0.00a')}
</tspan></text> <text x="635.7" y="54.9" text-anchor="end" class="text_top"><tspan class="info_span">APR: </tspan><tspan class="data_span">
${apr.toNumber().toLocaleString(undefined, { maximumFractionDigits: 2 })}
%</tspan></text> <text x="331.5" y="1001.97" text-anchor="middle" class="text_bottom"><tspan class="info_span">EARNED: </tspan><tspan class="data_span" x="331.5" dy="51.85">&#36;
${png.symbol} ${formatUnits(pendingRewards, png.decimals)}
</tspan></text> </svg>`;

  const encodedImage = Buffer.from(imageStr).toString('base64');

  return {
    name: `Pangolin Staking Position #${positionId}`,
    description:
      'This NFT perpetually receives share from the revenue generated by Pangolin. The share of the position is positively correlated to its staked balance and staking duration.',
    external_url: 'https://app.pangolin.exchange/#/stakev2',
    attributes: [
      { trait_type: 'Balance', value: balance.toString() },
      { display_type: 'date', trait_type: 'Entry Time', value: entryTime.toString() },
      { display_type: 'number', max_value: '9', trait_type: 'Duration Level', value: durationLevel },
    ],
    image: encodedImage,
  } as URI;
}
