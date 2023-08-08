/* eslint-disable max-lines */
import {
  BRIDGES,
  Bridge,
  BridgeChain,
  BridgeCurrency,
  Chain,
  CurrencyAmount,
  LIFI as LIFIBridge,
  NetworkType,
  RANGO,
  SQUID,
  Currency,
} from '@pangolindex/sdk';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RefreshCcw, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';
import { ThemeContext } from 'styled-components';
import CircleTick from 'src/assets/images/circleTick.svg';
import ErrorTick from 'src/assets/images/errorTick.svg';
import {
  Box,
  Button,
  Loader,
  SelectBridgeCurrencyDrawer,
  SelectChainDrawer,
  Text,
  ChainInput,
  CurrencyInput,
  TextInput,
} from 'src/components';

import { Option } from 'src/components/DropdownMenu/types';
import { injected } from 'src/connectors';
import { useChainId, useLibrary } from 'src/hooks';
import { useBridgeChains } from 'src/hooks/bridge/Chains';
import { useBridgeCurrencies } from 'src/hooks/bridge/Currencies';
import { useActiveWeb3React } from 'src/hooks/useConnector';
import useDebounce from 'src/hooks/useDebounce';
import { useApplicationState } from 'src/state/papplication/atom';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { ChainField, CurrencyField, TransactionStatus } from 'src/state/pbridge/atom';
import { useBridgeActionHandlers, useBridgeSwapActionHandlers, useDerivedBridgeInfo } from 'src/state/pbridge/hooks';
import { checkAddressNetworkBaseMapping } from 'src/utils';
import { maxAmountSpend } from 'src/utils/maxAmountSpend';
import { changeNetwork } from 'src/utils/wallet';
import {
  ArrowWrapper,
  BottomText,
  CardWrapper,
  CloseCircle,
  TransactionText,
  Wrapper,
  ChainsWrapper,
  StyledBalanceMax,
  TokenWrapper,
} from './styles';
import { OrtegeCardProps } from './types';

const OrtegeCard: React.FC<OrtegeCardProps> = (props) => {
  const { account, fromChain, toChain, inputCurrency, outputCurrency, recipient, slippageTolerance, getRoutes } = props;

  const toggleWalletModal = useWalletModalToggle();
  const theme = useContext(ThemeContext);

  const bridges = BRIDGES.map((bridge: Bridge) => ({ label: bridge.name, value: bridge.id }));
  const { activate, deactivate, connector } = useActiveWeb3React();

  const [isChainDrawerOpen, setIsChainDrawerOpen] = useState(false);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [activeBridges, setActiveBridges] = useState<MultiValue<Option>>(bridges);
  const { t } = useTranslation();
  const {
    currencyBalances,
    parsedAmount,
    selectedRoute,
    transactionLoaderStatus,
    transactionError,
    transactionStatus,
  } = useDerivedBridgeInfo();

  const chainHook = useBridgeChains();

  console.log('chainHook', chainHook);
  const currencyHook = useBridgeCurrencies();
  const sdkChainId = useChainId();
  const [drawerType, setDrawerType] = useState(ChainField.FROM);

  const { wallets } = useApplicationState();

  const { library } = useLibrary();

  const { sendTransaction } = useBridgeSwapActionHandlers();

  const isToAddress = checkAddressNetworkBaseMapping[toChain?.network_type || NetworkType.EVM];

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
  }, [activeBridges, chainHook?.[LIFIBridge.id], chainHook?.[SQUID.id], chainHook?.[RANGO.id]]);

  useEffect(() => {
    if (
      debouncedAmountValue &&
      inputCurrency &&
      outputCurrency &&
      toChain &&
      (toChain?.network_type === NetworkType.EVM || isToAddress(recipient, toChain))
    ) {
      onChangeRouteLoaderStatus();
      getRoutes({
        amount: debouncedAmountValue,
        slipLimit: slippageTolerance,
        fromChain,
        toChain,
        fromAddress: account,
        fromCurrency: inputCurrency,
        toCurrency: outputCurrency,
        recipient,
      });
    }
  }, [debouncedAmountValue, slippageTolerance, inputCurrency, outputCurrency, recipient, account]);

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

  const isAddress = checkAddressNetworkBaseMapping[toChain?.network_type || NetworkType.EVM];

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
            <X color={theme.ortege?.loaderCloseIconColor} size={10} />
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
            <X color={theme.ortege?.loaderCloseIconColor} size={10} />
          </CloseCircle>
          <Box flex="1" display="flex" alignItems="center" flexDirection={'column'} justifyContent={'center'}>
            <img src={CircleTick} alt="circle-tick" />
            <TransactionText>{t('bridge.bridgeCard.transactionSucceeded')}</TransactionText>
          </Box>
        </CardWrapper>
      )}
      <Text fontSize={24} fontWeight={700} color={'ortege.text'} pb={30}>
        {t('ortege.ortegeCard.sendTokens')}
      </Text>
      <ChainsWrapper>
        <Box>
          <Text fontSize={16} color={'ortege.text'}>
            {t('common.from')}
          </Text>

          <ChainInput
            buttonStyle={{
              backgroundColor: theme.ortege?.primaryBgColor,
              color: theme.ortege?.text,
              padding: '13px',
              borderRadius: '8px',
              width: '100%',
            }}
            onChainClick={() => {
              setDrawerType(ChainField.FROM);
              onChangeChainDrawerStatus();
            }}
            chain={fromChain as Chain}
          />
        </Box>

        <Box display={'flex'} justifyContent={'center'} alignContent={'center'} marginY={20}>
          <ArrowWrapper
            clickable={toChain?.network_type === NetworkType.EVM}
            onClick={() => {
              if (toChain?.network_type === NetworkType.EVM) {
                onSwitchChains();
              }
            }}
          >
            <RefreshCcw size="16" color={theme.ortege?.text} />
          </ArrowWrapper>
        </Box>

        <Box>
          <Text fontSize={16} color={'ortege.text'}>
            {t('common.to')}
          </Text>

          <ChainInput
            buttonStyle={{
              backgroundColor: theme.ortege?.primaryBgColor,
              color: theme.ortege?.text,
              padding: '13px',
              borderRadius: '8px',
              width: '100%',
            }}
            onChainClick={() => {
              setDrawerType(ChainField.TO);
              onChangeChainDrawerStatus();
            }}
            chain={toChain as Chain}
          />
        </Box>
      </ChainsWrapper>

      <TokenWrapper>
        <Box>
          <Text fontSize={16} color={'ortege.text'}>
            {t('ortege.ortegeCard.token')}
          </Text>
          <CurrencyInput
            buttonStyle={{
              backgroundColor: theme.ortege?.primaryBgColor,
              color: theme.ortege?.text,
              padding: '13px',
              borderRadius: '8px',
              width: '100%',
            }}
            alternativeLogoSrc={inputCurrency?.logo}
            onTokenClick={onChangeTokenDrawerStatus}
            isShowTextInput={false}
            currency={inputCurrency as Currency}
            id="swap-currency-input"
          />
        </Box>

        <TextInput
          value={''}
          addonAfter={
            // !atMaxAmounts[Field.CURRENCY_A] ? (
            <Box display={'flex'} alignItems={'center'} height={'100%'} justifyContent={'center'}>
              <StyledBalanceMax
                // onClick={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '', pairAddress)}
                onClick={() => {}}
              >
                {t('currencyInputPanel.max')}
              </StyledBalanceMax>
            </Box>
            // ) : (
            //   ''
            // )
          }
          onChange={(value: any) => {}}
          label={`Amount`}
          labelColor={'ortege.text'}
          fontSize={16}
          isNumeric={true}
          placeholder="0.00"
          addonLabel={
            account && (
              <Text color="text2" fontWeight={500} fontSize={12}>
                10.235
                {/* {!!currencyA && selectedCurrencyBalanceA ? selectedCurrencyBalanceA?.toSignificant(4) : ' -'} */}
              </Text>
            )
          }
        />
      </TokenWrapper>

      <Box pt={20}>
        <TextInput
          label={t('bridge.bridgeInputsWidget.recipient')}
          labelColor={'ortege.text'}
          addonAfter={
            // !atMaxAmounts[Field.CURRENCY_A] ? (
            <Box display={'flex'} alignItems={'center'} height={'100%'} justifyContent={'center'}>
              <StyledBalanceMax
                // onClick={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '', pairAddress)}
                onClick={() => {}}
              >
                {t('ortege.ortegeCard.self')}
              </StyledBalanceMax>
            </Box>
            // ) : (
            //   ''
            // )
          }
          placeholder={t('bridge.bridgeInputsWidget.walletAddress')}
          value={recipient as string}
          required={true}
          onChange={(value) => {
            const withoutSpaces: string = value.replace(/\s+/g, '');
            changeRecipient(withoutSpaces);
          }}
          addonLabel={
            recipient && toChain ? (
              !isAddress(recipient, toChain) && (
                <Text color="warning">{t('bridge.bridgeInputsWidget.invalidAddress')}</Text>
              )
            ) : (
              <Text color="error">{t('common.required')}</Text>
            )
          }
        />
      </Box>

      <Box mt={10}>
        {!account ? (
          <Button variant="primary" onClick={toggleWalletModal}>
            {t('earn.connectWallet')}
          </Button>
        ) : sdkChainId !== fromChain?.chain_id ? (
          <Button
            variant="primary"
            onClick={() => {
              fromChain &&
                changeNetwork({
                  chain: fromChain as Chain,
                  wallets: Object.values(wallets),
                  activate,
                  deactivate,
                  connector: connector ?? injected,
                });
            }}
            isDisabled={!fromChain || (toChain?.network_type === NetworkType.EVM && !recipient)}
          >
            {fromChain ? t('bridge.bridgeCard.switchChain') : t('bridge.bridgeCard.selectChain')}
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

      {isChainDrawerOpen && (
        <SelectChainDrawer
          isOpen={isChainDrawerOpen}
          // We can't show non-evm chains here. Because we don't have non-evm chain wallet integration yet. (in Bridge wise.)
          chains={
            drawerType === ChainField.FROM ? chainList?.filter((x) => x.network_type === NetworkType.EVM) : chainList
          }
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

export default OrtegeCard;
