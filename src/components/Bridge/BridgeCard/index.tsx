/* eslint-disable max-lines */
import {
  BRIDGES,
  Bridge,
  BridgeChain,
  BridgeCurrency,
  Chain,
  CurrencyAmount,
  LIFI as LIFIBridge,
  SQUID,
  // THORSWAP,
} from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCcw, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import ErrorTick from 'src/assets/images/errorTick.svg';
import {
  Box,
  Button,
  Collapsed,
  DropdownMenu,
  Loader,
  SelectBridgeCurrencyDrawer,
  SelectChainDrawer,
  SlippageInput,
  Text,
} from 'src/components';
import { Option } from 'src/components/DropdownMenu/types';
import { useChainId, useLibrary } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
import useDebounce from 'src/hooks/useDebounce';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { ChainField, CurrencyField, TransactionStatus } from 'src/state/pbridge/actions';
import { useBridgeActionHandlers, useBridgeSwapActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
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
import { BridgeCardProps } from './types';

const BridgeCard: React.FC<BridgeCardProps> = (props) => {
  const {
    account,
    fromChain,
    toChain,
    inputCurrency,
    outputCurrency,
    recipient,
    slippageTolerance,
    getRoutes,
    setSlippageTolerance,
  } = props;

  const toggleWalletModal = useWalletModalToggle();
  const theme = useContext(ThemeContext);

  const bridges = BRIDGES.map((bridge: Bridge) => ({ label: bridge.name, value: bridge.id }));
  const [isChainDrawerOpen, setIsChainDrawerOpen] = useState(false);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeBridges, setActiveBridges] = useState<MultiValue<Option>>(bridges);
  const { t } = useTranslation();
  const {
    currencyBalances,
    parsedAmount,
    estimatedAmount,
    amountNet,
    selectedRoute,
    transactionLoaderStatus,
    transactionError,
    transactionStatus,
  } = useDerivedBridgeInfo();

  const chainHook = useBridgeChains();
  const currencyHook = useBridgeCurrencies();
  const sdkChainId = useChainId();
  const [drawerType, setDrawerType] = useState(ChainField.FROM);

  const { library } = useLibrary();

  const { sendTransaction } = useBridgeSwapActionHandlers();

  const onSendTransaction = useCallback(() => {
    selectedRoute?.bridgeType?.id && sendTransaction[selectedRoute?.bridgeType?.id](library, selectedRoute, account);
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

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(sdkChainId, currencyBalances[CurrencyField.INPUT]);

  const debouncedAmountValue = useDebounce(parsedAmount?.toExact(), 1500);

  const allBridgeCurrencies = useMemo(() => {
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
      return data;
    }
  }, [currencyHook?.[LIFIBridge.id], currencyHook?.[SQUID.id], activeBridges]);

  const inputCurrencyList = useMemo(() => {
    const data = allBridgeCurrencies?.filter((val) => val?.chainId === fromChain?.chain_id?.toString());
    return data;
  }, [fromChain, allBridgeCurrencies]);

  const outputCurrencyList = useMemo(() => {
    const data = allBridgeCurrencies?.filter((val) => val?.chainId === toChain?.chain_id?.toString());
    return data;
  }, [toChain, allBridgeCurrencies]);

  const chainList = useMemo(() => {
    if (activeBridges) {
      let data: BridgeChain[] = [];
      activeBridges.forEach((bridge: Option) => {
        data = data
          ?.concat(chainHook[bridge.value])
          ?.filter((val, index, self) => index === self.findIndex((t) => t?.chain_id === val?.chain_id));
      });

      if (activeBridges.length === 0) {
        data = [];
      }
      return data;
    }
  }, [activeBridges, chainHook?.[LIFIBridge.id], chainHook?.[SQUID.id]]);

  const provider = useMemo(() => {
    if (window.xfi && window.xfi.ethereum) {
      return window.xfi.ethereum;
    } else if (window.bitkeep && window.isBitKeep) {
      return window.bitkeep.ethereum;
    }
    return window.ethereum;
  }, undefined);

  const { ethereum } = window;
  interface MetamaskError {
    code: number;
    message: string;
  }

  const changeChain = async () => {
    const chain = fromChain;
    if (ethereum && chain) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chain?.chain_id?.toString(16)}` }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        const metamask = error as MetamaskError;
        if (metamask.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: chain.name,
                  chainId: `0x${chain?.chain_id?.toString(16)}`,
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
  };

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
  }, [debouncedAmountValue, slippageTolerance, inputCurrency, outputCurrency]);

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
        title="To"
        onChangeRecipient={changeRecipient}
        recipient={recipient}
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
        ) : sdkChainId !== fromChain?.chain_id ? (
          <Button variant="primary" onClick={changeChain} isDisabled={!fromChain}>
            {fromChain ? 'Switch Chain' : 'Please Select Chain'}
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
                {t('bridge.bridgeCard.advancedOptions')}
              </Text>
              <ChevronDown size={16} color={theme.bridge?.text} />
            </Box>
          }
          expand={
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
              <Text fontSize={16} fontWeight={500} color={'bridge.text'}>
                {t('bridge.bridgeCard.advancedOptions')}
              </Text>
              <ChevronRight size={16} color={theme.bridge?.text} />
            </Box>
          }
        >
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
