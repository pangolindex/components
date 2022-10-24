/* eslint-disable max-lines */
import { BRIDGES, Bridge, BridgeCurrency, Chain, CurrencyAmount } from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCcw, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MultiValue, SingleValue } from 'react-select';
import { ThemeContext } from 'styled-components';
import {
  Box,
  Button,
  Checkbox,
  Collapsed,
  DropdownMenu,
  Loader,
  SelectBridgeCurrencyDrawer,
  SelectChainDrawer,
  SlippageInput,
  Text,
} from 'src/components';
import { Option } from 'src/components/DropdownMenu/types';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
import useDebounce from 'src/hooks/useDebounce';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { ChainField, CurrencyField } from 'src/state/pbridge/actions';
import { useBridgeActionHandlers, useBridgeSwapActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import BridgeInputsWidget from '../BridgeInputsWidget';
import { ArrowWrapper, BottomText, CloseCircle, FilterBox, FilterInputHeader, LoaderWrapper, Wrapper } from './styles';

const BridgeCard = () => {
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();
  const theme = useContext(ThemeContext);

  const bridges = BRIDGES.map((bridge: Bridge) => ({ label: bridge.name, value: bridge.id }));
  const [isChainDrawerOpen, setIsChainDrawerOpen] = useState(false);
  const [isInputCurrencyDrawerOpen, setIsInputCurrencyDrawerOpen] = useState(false);
  const [isOutputCurrencyDrawerOpen, setIsOutputCurrencyDrawerOpen] = useState(false);
  const [activeBridgePrioritization, setActiveBridgePrioritization] = useState<
    MultiValue<Option> | SingleValue<string>
  >('');
  const [activeBridges, setActiveBridges] = useState<MultiValue<Option>>(bridges);
  const [activeExchanges, setActiveExchanges] = useState<MultiValue<Option> | SingleValue<string>>([]);
  const [userSlippage] = useUserSlippageTolerance();
  const [slippageTolerance, setSlippageTolerance] = useState((userSlippage / 100).toString());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const BridgePrioritizationItems = [
    {
      label: t('bridge.bridgePrioritizations.recommended'),
      value: 'recommended',
    },
    {
      label: t('bridge.bridgePrioritizations.fast'),
      value: 'fast',
    },
    {
      label: t('bridge.bridgePrioritizations.normal'),
      value: 'normal',
    },
  ];
  const [inputCurrencyList, setInputCurrencyList] = useState<BridgeCurrency[]>([]);
  const [outputCurrencyList, setOutputCurrencyList] = useState<BridgeCurrency[]>([]);
  const [chainList, setChainList] = useState<Chain[] | undefined>(undefined);
  const chainHook = useBridgeChains();
  const [allBridgeCurrencies, setAllBridgeCurrencies] = useState<BridgeCurrency[]>([]);
  const currencyHook = useBridgeCurrencies();
  const chainId = useChainId();
  const [drawerType, setDrawerType] = useState(ChainField.FROM);

  const Exchanges = [
    {
      label: 'Pangolin',
      value: 'pangolin',
    },
    {
      label: 'Uniswap',
      value: 'uniswap',
    },
    {
      label: '1Inch',
      value: '1inch',
    },
    {
      label: 'Quickswap',
      value: 'quickswap',
    },
  ];

  const onChangeTokenDrawerStatus = useCallback(
    (type: ChainField) => {
      if (type === ChainField.FROM) {
        setIsInputCurrencyDrawerOpen(!isInputCurrencyDrawerOpen);
      } else {
        setIsOutputCurrencyDrawerOpen(!isOutputCurrencyDrawerOpen);
      }
    },
    [isInputCurrencyDrawerOpen, isOutputCurrencyDrawerOpen],
  );

  const onChangeChainDrawerStatus = useCallback(() => {
    setIsChainDrawerOpen(!isChainDrawerOpen);
  }, [isChainDrawerOpen]);

  const {
    onSwitchTokens,
    onSwitchChains,
    onCurrencySelection,
    onChainSelection,
    onUserInput,
    onChangeRecipient,
    onChangeRouteLoaderStatus,
  } = useBridgeActionHandlers();

  const { getRoutes } = useBridgeSwapActionHandlers();

  const { currencies, chains, currencyBalances, parsedAmount, estimatedAmount, recipient } = useDerivedBridgeInfo();

  const inputCurrency = currencies[CurrencyField.INPUT];
  const outputCurrency = currencies[CurrencyField.OUTPUT];

  const fromChain = chains[ChainField.FROM];
  const toChain = chains[ChainField.TO];

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(chainId, currencyBalances[CurrencyField.INPUT]);
  const debouncedAmountValue = useDebounce(parsedAmount?.toExact(), 500);

  useEffect(() => {
    //TODO: Error in this function
    if (currencyHook) {
      let data: BridgeCurrency[] = [];
      Object.values(currencyHook).forEach((value) => {
        data = data
          ?.concat(value)
          ?.filter(
            (val, index, self) =>
              index === self.findIndex((t) => t?.symbol === val?.symbol && t?.chainId === val?.chainId),
          );
      });
      setAllBridgeCurrencies(data || []);
    }
  }, [currencyHook?.lifi, currencyHook?.thorswap]);

  useEffect(() => {
    if (allBridgeCurrencies && fromChain) {
      const data = allBridgeCurrencies?.filter((val) => val?.chainId === fromChain?.chain_id);
      setInputCurrencyList(data || []);
    }
  }, [fromChain]);

  useEffect(() => {
    if (allBridgeCurrencies && toChain) {
      const data = allBridgeCurrencies?.filter((val) => val?.chainId === toChain?.chain_id);
      setOutputCurrencyList(data);
    }
  }, [toChain]);

  useEffect(() => {
    if (activeBridges) {
      let data: Chain[] = [];
      activeBridges.forEach((bridge: Option) => {
        data = data
          ?.concat(chainHook[bridge.value])
          ?.filter((val, index, self) => index === self.findIndex((t) => t?.chain_id === val?.chain_id));
      });

      if (activeBridges.length === 0) {
        Object.values(chainHook).forEach((value) => {
          data = data
            ?.concat(value)
            ?.filter((val, index, self) => index === self.findIndex((t) => t?.chain_id === val?.chain_id));
        });
      }

      setChainList(data || []);
    }
  }, [activeBridges, chainHook?.lifi, chainHook?.thorswap]);

  useEffect(() => {
    if (debouncedAmountValue) {
      onChangeRouteLoaderStatus();
      getRoutes(
        debouncedAmountValue,
        slippageTolerance,
        fromChain,
        toChain,
        account,
        inputCurrency,
        outputCurrency,
        recipient,
      );
    }
  }, [debouncedAmountValue]);

  const changeAmount = useCallback(
    (field: CurrencyField, amount: string) => {
      onUserInput(field, amount);
    },
    [onUserInput],
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && changeAmount(CurrencyField.INPUT, maxAmountInput?.toExact());
  }, [maxAmountInput, changeAmount]);

  const onCurrencySelect = useCallback(
    (currency: BridgeCurrency) => {
      onCurrencySelection(drawerType === ChainField.FROM ? CurrencyField.INPUT : CurrencyField.OUTPUT, currency);
    },
    [drawerType, onCurrencySelection],
  );

  const onChainSelect = useCallback(
    (chain: Chain) => {
      onChainSelection(drawerType, chain);
    },
    [drawerType, onChainSelection],
  );

  const changeRecipient = useCallback(
    (recipient: string) => {
      onChangeRecipient(recipient);
    },
    [onChangeRecipient],
  );

  return (
    <Wrapper>
      {isLoading && (
        <LoaderWrapper>
          <CloseCircle
            onClick={() => {
              setIsLoading(!isLoading);
            }}
          >
            <X color={theme.bridge?.loaderCloseIconColor} size={10} />
          </CloseCircle>
          <Loader height={'auto'} label={t('bridge.bridgeCard.loader.labels.waitingReceivingChain')} size={100} />
          <BottomText>{t('bridge.bridgeCard.loader.bottomText')}</BottomText>
        </LoaderWrapper>
      )}
      <Text fontSize={24} fontWeight={700} color={'bridge.text'} pb={30}>
        {t('bridge.bridgeCard.title')}
      </Text>
      <BridgeInputsWidget
        onChangeTokenDrawerStatus={() => {
          setDrawerType(ChainField.FROM);
          onChangeTokenDrawerStatus(ChainField.FROM);
        }}
        onChangeChainDrawerStatus={() => {
          setDrawerType(ChainField.FROM);
          onChangeChainDrawerStatus();
        }}
        onChangeAmount={(amount) => {
          changeAmount(CurrencyField.INPUT, amount);
        }}
        maxAmountInput={maxAmountInput}
        amount={parsedAmount}
        handleMaxInput={handleMaxInput}
        title="From"
        inputDisabled={false}
        chain={fromChain}
        currency={inputCurrency}
      />
      <Box display={'flex'} justifyContent={'center'} alignContent={'center'} marginY={20}>
        <ArrowWrapper
          onClick={() => {
            onSwitchTokens();
            onSwitchChains();
          }}
        >
          <RefreshCcw size="16" color={theme.bridge?.text} />
        </ArrowWrapper>
      </Box>
      <BridgeInputsWidget
        onChangeTokenDrawerStatus={() => {
          setDrawerType(ChainField.TO);
          onChangeTokenDrawerStatus(ChainField.TO);
        }}
        onChangeChainDrawerStatus={() => {
          setDrawerType(ChainField.TO);
          onChangeChainDrawerStatus();
        }}
        onChangeRecipient={changeRecipient}
        recipient={recipient}
        title="To"
        inputDisabled={true}
        amount={estimatedAmount}
        chain={toChain}
        currency={outputCurrency}
      />
      <Box marginY={30}>
        {!account ? (
          <Button variant="primary" onClick={toggleWalletModal}>
            Connect Wallet
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              setIsLoading(true);
            }}
          >
            {t('bridge.bridgeCard.swap')}
          </Button>
        )}
      </Box>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
        <Collapsed
          collapse={
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
              <Text fontSize={16} fontWeight={500} color={'bridge.text'}>
                {t('bridge.bridgeCard.advanceOptions')}
              </Text>
              <ChevronDown size={16} color={theme.bridge?.text} />
            </Box>
          }
          expand={
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
              <Text fontSize={16} fontWeight={500} color={'bridge.text'}>
                {t('bridge.bridgeCard.advanceOptions')}
              </Text>
              <ChevronRight size={16} color={theme.bridge?.text} />
            </Box>
          }
        >
          <FilterBox pt={'3.75rem'}>
            <FilterInputHeader>{t('bridge.bridgeCard.filter.bridgePrioritization')}</FilterInputHeader>
            <DropdownMenu
              options={BridgePrioritizationItems}
              defaultValue={activeBridgePrioritization}
              onSelect={(value) => {
                setActiveBridgePrioritization(value);
              }}
            />
          </FilterBox>
          <FilterBox>
            <FilterInputHeader>{t('bridge.bridgeCard.filter.slippage')}</FilterInputHeader>
            <SlippageInput
              showTitle={false}
              expertMode={false}
              slippageTolerance={slippageTolerance}
              setSlippageTolerance={setSlippageTolerance}
            />
          </FilterBox>
          <FilterBox>
            <FilterInputHeader>{t('bridge.bridgeCard.filter.infiniteApproval')}</FilterInputHeader>
            <Checkbox labelColor={'bridge.text'} label={t('bridge.bridgeCard.filter.activeInfiniteApproval')} />
          </FilterBox>
          <FilterBox>
            <FilterInputHeader>{t('bridge.bridgeCard.filter.bridges')}</FilterInputHeader>
            <DropdownMenu
              options={bridges}
              defaultValue={activeBridges}
              isMulti={true}
              menuPlacement={'top'}
              onSelect={(value) => {
                setActiveBridges(value as MultiValue<Option>);
              }}
            />
          </FilterBox>
          <FilterBox>
            <FilterInputHeader>{t('bridge.bridgeCard.filter.exchanges')}</FilterInputHeader>
            <DropdownMenu
              options={Exchanges}
              defaultValue={activeExchanges}
              isMulti={true}
              menuPlacement={'top'}
              onSelect={(value) => {
                setActiveExchanges(value);
              }}
            />
          </FilterBox>
        </Collapsed>
      </Box>
      {isChainDrawerOpen && (
        <SelectChainDrawer
          isOpen={isChainDrawerOpen}
          chains={chainList}
          onClose={onChangeChainDrawerStatus}
          onChainSelect={onChainSelect}
          selectedChain={drawerType === ChainField.FROM ? fromChain : toChain}
          otherSelectedChain={drawerType === ChainField.TO ? toChain : fromChain}
        />
      )}
      {isInputCurrencyDrawerOpen && (
        <SelectBridgeCurrencyDrawer
          isOpen={isInputCurrencyDrawerOpen}
          bridgeCurrencies={inputCurrencyList}
          onClose={() => {
            onChangeTokenDrawerStatus(ChainField.FROM);
          }}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={drawerType === ChainField.FROM ? inputCurrency : outputCurrency}
          otherSelectedCurrency={drawerType === ChainField.TO ? outputCurrency : inputCurrency}
        />
      )}
      {isOutputCurrencyDrawerOpen && (
        <SelectBridgeCurrencyDrawer
          isOpen={isOutputCurrencyDrawerOpen}
          bridgeCurrencies={outputCurrencyList}
          onClose={() => {
            onChangeTokenDrawerStatus(ChainField.TO);
          }}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={drawerType === ChainField.FROM ? inputCurrency : outputCurrency}
          otherSelectedCurrency={drawerType === ChainField.TO ? outputCurrency : inputCurrency}
        />
      )}
    </Wrapper>
  );
};

export default BridgeCard;
