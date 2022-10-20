import { parseUnits } from '@ethersproject/units';
import { CAVAX, Chain, ChainId, Currency, CurrencyAmount, JSBI, Token, TokenAmount } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useCurrency } from 'src/hooks/Tokens';
import { useBridgeChainsAlternativeApproach } from 'src/hooks/bridge/Chains';
import { useThorChainRoutes } from 'src/hooks/bridge/Routes';
import { AppState, useDispatch, useSelector } from 'src/state';
import { useCurrencyBalances } from '../pwallet/hooks';
import {
  ChainField,
  CurrencyField,
  changeRouteLoaderStatus,
  selectChain,
  selectCurrency,
  selectRoute,
  setRecipient,
  setRoutes,
  switchChains,
  switchCurrencies,
  typeAmount,
} from './actions';
import { Route } from './types';

export function useBridgeState(): AppState['pbridge'] {
  return useSelector<AppState['pbridge']>((state) => state.pbridge);
}

export function useBridgeActionHandlers(chainId: ChainId): {
  onCurrencySelection: (field: CurrencyField, currency: Currency) => void;
  onChainSelection: (field: ChainField, chain: Chain) => void;
  onSwitchTokens: () => void;
  onSelectRoute: (route: Route) => void;
  onSwitchChains: () => void;
  onUserInput: (field: CurrencyField, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
  onChangeRouteLoaderStatus: () => void;
} {
  const dispatch = useDispatch();
  const { routes, routesLoaderStatus } = useBridgeState();

  const onSelectRoute = (route: Route) => {
    const selectedRouteIndex = routes.findIndex((r) => r === route);
    dispatch(selectRoute({ selectedRoute: selectedRouteIndex }));
  };

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

  const onChangeRouteLoaderStatus = useCallback(() => {
    dispatch(changeRouteLoaderStatus({ routesLoaderStatus: !routesLoaderStatus }));
  }, [dispatch]);

  return {
    onSwitchTokens,
    onCurrencySelection,
    onChainSelection,
    onSwitchChains,
    onSelectRoute,
    onUserInput,
    onChangeRecipient,
    onChangeRouteLoaderStatus,
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
  routes?: Route[];
  estimatedAmount?: CurrencyAmount | undefined;
  recipient?: string | null;
  routesLoaderStatus?: boolean;
} {
  const { account } = usePangolinWeb3();
  const chainId = useChainId();
  const { data } = useBridgeChainsAlternativeApproach();

  // select the current chain if it is supported by the bridge
  const currentChain = data?.find((x) => x.chain_id?.toString() === chainId?.toString()) || undefined;
  const {
    typedValue,
    [CurrencyField.INPUT]: { currencyId: inputCurrencyId },
    [CurrencyField.OUTPUT]: { currencyId: outputCurrencyId },
    [ChainField.FROM]: { chainId: fromChainId },
    [ChainField.TO]: { chainId: toChainId },
    routes,
    recipient,
    routesLoaderStatus,
  } = useBridgeState();
  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const fromChain = fromChainId ? data?.find((x) => x.id === fromChainId) : currentChain;
  const toChain = toChainId ? data?.find((x) => x.id === toChainId) : undefined;
  const relevantTokenBalances = useCurrencyBalances(chainId, account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined, chainId);
  const selectedRoute = routes?.find((x: Route) => x.selected);
  const estimatedAmount = tryParseAmount(selectedRoute?.toAmount, outputCurrency ?? undefined, chainId);
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
    routes,
    estimatedAmount,
    recipient,
    routesLoaderStatus,
  };
}

export function useBridgeSwapActionHandlers(): {
  getRoutes: (
    amount: string,
    slipLimit: string,
    fromChain?: Chain,
    toChain?: Chain,
    fromAddress?: string | null,
    fromCurrency?: Currency,
    toCurrency?: Currency,
    recipient?: string | null | undefined,
  ) => void;
} {
  const dispatch = useDispatch();
  const getRoutes = async (
    amount: string,
    slipLimit: string,
    fromChain?: Chain,
    toChain?: Chain,
    fromAddress?: string | null,
    fromCurrency?: Currency,
    toCurrency?: Currency,
    recipient?: string | null | undefined,
  ) => {
    try {
      // TODO: Whole function needs to be refactored
      // const apiconfig = new Configuration({ basePath: BRIDGE_THORCHAIN_MIDGARD });
      // const midgardApi = new MidgardApi(apiconfig);
      // const poolsRes = await midgardApi.getPools();
      // const thorchainPoolResponse = await fetch(`${BRIDGE_THORCHAIN_THORNODE}/pools`);
      // const thorchainPoolData = await thorchainPoolResponse.json();
      // const asgardVaultResponse = await fetch(`${BRIDGE_THORCHAIN_MIDGARD}/v2/thorchain/inbound_addresses`);
      // const asgardVaults = await asgardVaultResponse.json();
      // const assetInput = assetToBase(assetAmount(amount));
      // const assetPool: PoolData = {
      //   assetBalance: assetToBase(assetAmount(thorchainPoolData[0].balance_asset)),
      //   runeBalance: assetToBase(assetAmount(thorchainPoolData[0].balance_rune)),
      // };
      // const assetPool2: PoolData = {
      //   assetBalance: assetToBase(assetAmount(thorchainPoolData[11].balance_asset)),
      //   runeBalance: assetToBase(assetAmount(thorchainPoolData[11].balance_rune)),
      // };
      if (parseFloat(amount) <= 0) {
        dispatch(setRoutes({ routes: [], routesLoaderStatus: false }));
        return;
      } else {
        useThorChainRoutes(
          amount,
          slipLimit,
          fromChain,
          toChain,
          fromAddress,
          fromCurrency,
          toCurrency,
          recipient,
        ).then((routes: Route[]) => {
          dispatch(setRoutes({ routes, routesLoaderStatus: false }));
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return {
    getRoutes,
  };
}
