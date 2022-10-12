import { parseUnits } from '@ethersproject/units';
import {
  ALL_CHAINS,
  CAVAX,
  Chain,
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
} from '@pangolindex/sdk';
import {
  PoolData,
  getDoubleSwapFee,
  getDoubleSwapOutput,
  getDoubleSwapOutputWithFee,
  getDoubleSwapSlip,
} from '@thorchain/asgardex-util';
import { Configuration, MidgardApi } from '@xchainjs/xchain-midgard';
import { assetAmount, assetToBase, baseAmount, baseToAsset } from '@xchainjs/xchain-util';
import React, { useCallback } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useCurrency } from 'src/hooks/Tokens';
import { AppState, useDispatch, useSelector } from 'src/state';
import { useCurrencyBalances } from '../pwallet/hooks';
import {
  ChainField,
  CurrencyField,
  selectChain,
  selectCurrency,
  setRecipient,
  switchChains,
  switchCurrencies,
  typeAmount,
} from './actions';

export function useBridgeState(): AppState['pbridge'] {
  return useSelector<AppState['pbridge']>((state) => state.pbridge);
}

export function useBridgeActionHandlers(chainId: ChainId): {
  onCurrencySelection: (field: CurrencyField, currency: Currency) => void;
  onChainSelection: (field: ChainField, chain: Chain) => void;
  onSwitchTokens: () => void;
  onSwitchChains: () => void;
  onUserInput: (field: CurrencyField, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const dispatch = useDispatch();
  const onCurrencySelection = useCallback(
    (field: CurrencyField, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId:
            currency instanceof Token
              ? currency.address
              : currency === CAVAX[chainId] && CAVAX[chainId]?.symbol
              ? (CAVAX[chainId]?.symbol as string)
              : '',
        }),
      );
    },
    [dispatch],
  );

  const onChainSelection = useCallback(
    (field: ChainField, chain: Chain) => {
      dispatch(
        selectChain({
          field,
          chainId: chain ? chain.id : '',
        }),
      );
    },
    [dispatch],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onSwitchChains = useCallback(() => {
    dispatch(switchChains());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: CurrencyField, typedValue: string) => {
      dispatch(typeAmount({ field, typedValue }));
    },
    [dispatch],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch],
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onChainSelection,
    onSwitchChains,
    onUserInput,
    onChangeRecipient,
  };
}

export function tryParseAmount(
  value?: string,
  currency?: Currency,
  chainId: ChainId = ChainId.AVALANCHE,
): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed), chainId);
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

export function useDerivedBridgeInfo(): {
  currencies: { [field in CurrencyField]?: Currency };
  chains: { [field in ChainField]?: Chain };
  currencyBalances: { [field in CurrencyField]?: CurrencyAmount };
  parsedAmount: CurrencyAmount | undefined;
  inputError?: string;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();

  const {
    typedValue,
    [CurrencyField.INPUT]: { currencyId: inputCurrencyId },
    [CurrencyField.OUTPUT]: { currencyId: outputCurrencyId },
    [ChainField.FROM]: { chainId: fromChainId },
    [ChainField.TO]: { chainId: toChainId },
  } = useBridgeState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const fromChain = fromChainId ? ALL_CHAINS.find((x) => x.id === fromChainId) : undefined;
  const toChain = toChainId ? ALL_CHAINS.find((x) => x.id === toChainId) : undefined;

  const relevantTokenBalances = useCurrencyBalances(chainId, account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined, chainId);

  const currencyBalances = {
    [CurrencyField.INPUT]: relevantTokenBalances[0],
    [CurrencyField.OUTPUT]: relevantTokenBalances[1],
  };

  const currencies: { [field in CurrencyField]?: Currency } = {
    [CurrencyField.INPUT]: inputCurrency ?? undefined,
    [CurrencyField.OUTPUT]: outputCurrency ?? undefined,
  };

  const chains: { [field in ChainField]?: Chain } = {
    [ChainField.FROM]: fromChain ?? undefined,
    [ChainField.TO]: toChain ?? undefined,
  };

  let inputError: string | undefined;
  if (!account) {
    inputError = 'Connect Wallet';
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount';
  }

  if (!currencies[CurrencyField.INPUT] || !currencies[CurrencyField.OUTPUT]) {
    inputError = inputError ?? 'Select a token';
  }

  if (!chains[ChainField.FROM] || !chains[ChainField.TO]) {
    inputError = inputError ?? 'Select a chain';
  }

  return {
    currencies,
    chains,
    currencyBalances,
    parsedAmount,
    inputError,
  };
}

//TODO:
export function useBridgeSwapActionHandlers(): {
  getRoutes: (amount: string) => void;
} {
  const getRoutes = async (amount: string) => {
    try {
      const midgardBaseUrl = 'https://midgard.ninerealms.com/';
      const thorchainBaseUrl = 'https://thornode.ninerealms.com/thorchain';
      const apiconfig = new Configuration({ basePath: midgardBaseUrl });
      const midgardApi = new MidgardApi(apiconfig);
      const poolsRes = await midgardApi.getPools();
      const thorchainPoolResponse = await fetch(`${thorchainBaseUrl}/pools`);
      const thorchainPoolData = await thorchainPoolResponse.json();
      const asgardVaultResponse = await fetch(`${midgardBaseUrl}/v2/thorchain/inbound_addresses`);
      const asgardVaults = await asgardVaultResponse.json();
      const assetInput = assetToBase(assetAmount(amount));
      const assetPool: PoolData = {
        assetBalance: assetToBase(assetAmount(thorchainPoolData[0].balance_asset)),
        runeBalance: assetToBase(assetAmount(thorchainPoolData[0].balance_rune)),
      };
      const assetPool2: PoolData = {
        assetBalance: assetToBase(assetAmount(thorchainPoolData[11].balance_asset)),
        runeBalance: assetToBase(assetAmount(thorchainPoolData[11].balance_rune)),
      };

      console.log(
        '\n Midgard pools: ',
        poolsRes.data,
        '\n Thorchain pools: ',
        thorchainPoolData,
        '\n asgardVaults: ',
        asgardVaults.filter((x) => !x.halted),
        `\n getDoubleSwapSlip: `,
        baseToAsset(baseAmount(getDoubleSwapSlip(assetInput, assetPool, assetPool2)))
          .amount()
          .toString(),
        `\n getDoubleSwapFee: ${thorchainPoolData[0].asset} -> ${thorchainPoolData[11].asset}`,
        baseToAsset(getDoubleSwapFee(assetInput, assetPool, assetPool2)).amount().toString(),
        '\n getDoubleSwapOutput: ${thorchainPoolData[0].asset} -> ${thorchainPoolData[11].asset}',
        baseToAsset(getDoubleSwapOutput(assetInput, assetPool, assetPool2)).amount().toNumber(),
        '\n getDoubleSwapOutputWithFee: ${thorchainPoolData[0].asset} -> ${thorchainPoolData[11].asset}',
        baseToAsset(
          getDoubleSwapOutputWithFee(
            assetInput,
            assetPool,
            assetPool2,
            getDoubleSwapFee(assetInput, assetPool, assetPool2),
          ),
        )
          .amount()
          .toNumber(),
      );
    } catch (error) {
      console.log(error);
    }
    // getSwapOutputWithFee();
    // const outputField: CurrencyField = CurrencyField.OUTPUT;
    // dispatch(typeAmount({ outputField, '0.1' }));
  };
  return {
    getRoutes,
  };
}
