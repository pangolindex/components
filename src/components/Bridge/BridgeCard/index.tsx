/* eslint-disable max-lines */
import {
  BRIDGES,
  Bridge,
  BridgeCurrency,
  Chain,
  CurrencyAmount,
  LIFI as LIFIBridge,
  SQUID,
  THORSWAP,
} from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCcw, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MultiValue, SingleValue } from 'react-select';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import ErrorTick from 'src/assets/images/errorTick.svg';
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
import { useChainId, useLibrary, usePangolinWeb3 } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
import useDebounce from 'src/hooks/useDebounce';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { ChainField, CurrencyField, TransactionStatus } from 'src/state/pbridge/actions';
import { useBridgeActionHandlers, useBridgeSwapActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { BridgePrioritizations } from 'src/state/pbridge/types';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import BridgeInputsWidget from '../BridgeInputsWidget';
import {
  ArrowWrapper,
  BottomText,
  CardWrapper,
  CloseCircle,
  FilterBox,
  FilterInputHeader,
  TransactionText,
  Wrapper,
} from './styles';

const BridgeCard = () => {
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();
  const theme = useContext(ThemeContext);

  const bridges = BRIDGES.map((bridge: Bridge) => ({ label: bridge.name, value: bridge.id }));
  const [isChainDrawerOpen, setIsChainDrawerOpen] = useState(false);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeBridgePrioritization, setActiveBridgePrioritization] = useState<
    MultiValue<Option> | SingleValue<string>
  >('');
  const [activeBridges, setActiveBridges] = useState<MultiValue<Option>>(bridges);
  const [activeExchanges, setActiveExchanges] = useState<MultiValue<Option> | SingleValue<string>>([]);
  const [userSlippage] = useUserSlippageTolerance();
  const [slippageTolerance, setSlippageTolerance] = useState((userSlippage / 100).toString());

  const { t } = useTranslation();
  const {
    currencies,
    chains,
    currencyBalances,
    parsedAmount,
    estimatedAmount,
    amountNet,
    recipient,
    selectedRoute,
    transactionLoaderStatus,
    transactionError,
    transactionStatus,
  } = useDerivedBridgeInfo();

  const BridgePrioritizationItems = Object.keys(BridgePrioritizations)
    .filter((v) => isNaN(Number(v)))
    .map((prioritization) => {
      return {
        label: t(`bridge.bridgePrioritizations.${prioritization?.toLowerCase()}`),
        value: prioritization?.toLowerCase(),
      };
    });

  const [inputCurrencyList, setInputCurrencyList] = useState<BridgeCurrency[]>([]);
  const [outputCurrencyList, setOutputCurrencyList] = useState<BridgeCurrency[]>([]);
  const [infiniteApproval, setInfiniteApproval] = useState<boolean>(false);
  const [chainList, setChainList] = useState<Chain[] | undefined>(undefined);
  const chainHook = useBridgeChains();
  const [allBridgeCurrencies, setAllBridgeCurrencies] = useState<BridgeCurrency[]>([]);
  const currencyHook = useBridgeCurrencies();
  const sdkChainId = useChainId();
  const [drawerType, setDrawerType] = useState(ChainField.FROM);

  const { library } = useLibrary();

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
  const { getRoutes, sendTransaction } = useBridgeSwapActionHandlers();

  // TODO: Switch chain
  // const { chainId, connector } = useWeb3React();
  // const changeNetwork = useCallback(
  //   (chain) => {
  //     connector?.getProvider().then((provider) => {
  //       provider
  //         ?.request({
  //           method: 'wallet_addEthereumChain',
  //           params: [chain],
  //         })
  //         .then((val: null) => {
  //           // The problem is; We can't understand if the user has changed the network or not.
  //           console.log('Network Changed: ', val);
  //         })
  //         .catch((error: any) => {
  //           console.log('error: ', error);
  //         });
  //     });
  //   },
  //   [connector],
  // );

  const onSendTransaction = useCallback(() => {
    selectedRoute?.bridgeType?.id &&
      sendTransaction[selectedRoute?.bridgeType?.id](
        library,
        // changeNetwork,
        // toChain,
        selectedRoute,
        account,
      );
  }, [selectedRoute]);

  const onChangeTokenDrawerStatus = useCallback(() => {
    setIsCurrencyDrawerOpen(!isCurrencyDrawerOpen);
  }, [isCurrencyDrawerOpen]);

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
    onClearTransactionData,
  } = useBridgeActionHandlers();

  const inputCurrency = currencies[CurrencyField.INPUT];
  const outputCurrency = currencies[CurrencyField.OUTPUT];

  const fromChain = chains[ChainField.FROM];
  const toChain = chains[ChainField.TO];

  // const onChangeNetwork = useCallback(() => {
  //   const data = {
  //     chainName: fromChain?.name,
  //     nativeCurrency: {
  //       name: fromChain?.nativeCurrency?.name,
  //       symbol: fromChain?.nativeCurrency?.symbol,
  //       decimals: fromChain?.nativeCurrency?.decimals,
  //     },
  //     blockExplorerUrls: fromChain?.blockExplorerUrls,
  //     chainId: '0x' + Number(fromChain?.chain_id)?.toString(16),
  //     rpcUrls: [fromChain?.rpc_uri],
  //   };
  //   changeNetwork(data);
  // }, [fromChain]);
  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(sdkChainId, currencyBalances[CurrencyField.INPUT]);

  const debouncedAmountValue = useDebounce(parsedAmount?.toExact(), 1500);

  useEffect(() => {
    if (currencyHook && activeBridges) {
      let data: BridgeCurrency[] = [];
      Object.entries(currencyHook).forEach(([key, value]) => {
        if (activeBridges.some((bridge) => bridge.value === key)) {
          data = data
            ?.concat(value)
            ?.filter(
              (val, index, self) =>
                index === self.findIndex((t) => t?.symbol === val?.symbol && t?.chainId === val?.chainId),
            );
        }
      });
      setAllBridgeCurrencies(data || []);
    }
  }, [currencyHook?.[LIFIBridge.id], currencyHook?.[THORSWAP.id], activeBridges]);

  useEffect(() => {
    if (allBridgeCurrencies && fromChain) {
      const data = allBridgeCurrencies?.filter((val) => val?.chainId === fromChain?.chain_id?.toString());
      setInputCurrencyList(data || []);
    }
  }, [fromChain, allBridgeCurrencies]);

  useEffect(() => {
    if (allBridgeCurrencies && toChain) {
      const data = allBridgeCurrencies?.filter((val) => val?.chainId === toChain?.chain_id?.toString());
      setOutputCurrencyList(data);
    }
  }, [toChain, allBridgeCurrencies]);

  useEffect(() => {
    if (activeBridges) {
      let data: Chain[] = [];
      activeBridges.forEach((bridge: Option) => {
        data = data
          ?.concat(chainHook[bridge.value])
          ?.filter((val, index, self) => index === self.findIndex((t) => t?.chain_id === val?.chain_id));
      });

      if (activeBridges.length === 0) {
        data = [];
      }

      setChainList(data || []);
    }
  }, [activeBridges, chainHook?.[LIFIBridge.id], chainHook?.[THORSWAP.id], chainHook?.[SQUID.id]]);

  useEffect(() => {
    if (debouncedAmountValue) {
      onChangeRouteLoaderStatus();
      getRoutes(
        debouncedAmountValue,
        slippageTolerance,
        infiniteApproval,
        fromChain,
        toChain,
        account,
        inputCurrency,
        outputCurrency,
        recipient,
      );
    }
  }, [debouncedAmountValue, slippageTolerance, infiniteApproval, inputCurrency, outputCurrency]);

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
      {transactionLoaderStatus && (
        <CardWrapper>
          <Loader height={'auto'} label={t('bridge.bridgeCard.loader.labels.waitingReceivingChain')} size={100} />
          <BottomText>{t('bridge.bridgeCard.loader.bottomText')}</BottomText>
        </CardWrapper>
      )}
      {transactionStatus === TransactionStatus.FAILED && (
        <CardWrapper>
          <CloseCircle
            onClick={() => {
              onClearTransactionData(transactionStatus);
            }}
          >
            <X color={theme.bridge?.loaderCloseIconColor} size={10} />
          </CloseCircle>
          <Box flex="1" display="flex" alignItems="center" flexDirection={'column'} justifyContent={'center'}>
            <img src={ErrorTick} alt="error-tick" />
            {transactionError && <TransactionText>{transactionError.message}</TransactionText>}
          </Box>
        </CardWrapper>
      )}
      {transactionStatus === TransactionStatus.SUCCESS && (
        <CardWrapper>
          <CloseCircle
            onClick={() => {
              onClearTransactionData(transactionStatus);
            }}
          >
            <X color={theme.bridge?.loaderCloseIconColor} size={10} />
          </CloseCircle>
          <Box flex="1" display="flex" alignItems="center" flexDirection={'column'} justifyContent={'center'}>
            <img src={CircleTick} alt="circle-tick" />
            <TransactionText>{t('bridge.bridgeCard.transactionSucceeded')}</TransactionText>
          </Box>
        </CardWrapper>
      )}
      <Text fontSize={24} fontWeight={700} color={'bridge.text'} pb={30}>
        {t('bridge.bridgeCard.title')}
      </Text>
      <BridgeInputsWidget
        onChangeTokenDrawerStatus={() => {
          setDrawerType(ChainField.FROM);
          onChangeTokenDrawerStatus();
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
          onChangeTokenDrawerStatus();
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
        amountNet={amountNet}
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
              onSendTransaction();
            }}
            isDisabled={!selectedRoute}
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
            <Checkbox
              value={infiniteApproval}
              onChange={(value) => setInfiniteApproval(value)}
              labelColor={'bridge.text'}
              label={t('bridge.bridgeCard.filter.activeInfiniteApproval')}
            />
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
      {isCurrencyDrawerOpen && (
        <SelectBridgeCurrencyDrawer
          isOpen={isCurrencyDrawerOpen}
          bridgeCurrencies={drawerType === ChainField.FROM ? inputCurrencyList : outputCurrencyList}
          onClose={() => {
            onChangeTokenDrawerStatus();
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
