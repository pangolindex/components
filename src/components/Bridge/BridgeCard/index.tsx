import React, { useCallback, useContext, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCcw, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MultiValue, SingleValue } from 'react-select';
import { ThemeContext } from 'styled-components';
import { Box, Button, Checkbox, Collapsed, DropdownMenu, Loader, Text } from 'src/components';
import SlippageInput from 'src/components/SlippageInput';
import SelectTokenDrawer from 'src/components/SwapWidget/SelectTokenDrawer';
import { usePangolinWeb3 } from 'src/hooks';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { useUserSlippageTolerance } from 'src/state/puser/hooks';
import BridgeInputsWidget from '../BridgeInputsWidget';
import { ArrowWrapper, BottomText, CloseCircle, FilterBox, FilterInputHeader, LoaderWrapper, Wrapper } from './styles';

const BridgeCard = () => {
  const { account } = usePangolinWeb3();
  const toggleWalletModal = useWalletModalToggle();
  const theme = useContext(ThemeContext);

  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [activeBridgePrioritization, setActiveBridgePrioritization] = useState<
    MultiValue<string> | SingleValue<string>
  >('');
  const [activeBridges, setActiveBridges] = useState<MultiValue<string> | SingleValue<string>>(['']);
  const [activeExchanges, setActiveExchanges] = useState<MultiValue<string> | SingleValue<string>>(['']);
  const [userslippage] = useUserSlippageTolerance();
  const [slippageTolerance, setSlippageTolerance] = useState((userslippage / 100).toString());
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

  const Bridges = [
    {
      label: 'Thorchain',
      value: 'thorchain',
    },
    {
      label: 'DeFiChain',
      value: 'defichain',
    },
  ];
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

  const onChangeTokenDrawerStatus = useCallback(() => {
    setIsTokenDrawerOpen(!isTokenDrawerOpen);
  }, [isTokenDrawerOpen]);

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
        isTokenDrawerOpen
        onChangeTokenDrawerStatus={onChangeTokenDrawerStatus}
        title="From"
        inputDisabled={false}
      />
      <Box display={'flex'} justifyContent={'center'} alignContent={'center'} marginY={20}>
        <ArrowWrapper>
          <RefreshCcw size="16" color={theme.bridge?.text} />
        </ArrowWrapper>
      </Box>
      <BridgeInputsWidget title="To" inputDisabled={true} />
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
              options={Bridges}
              defaultValue={activeBridges}
              isMulti={true}
              menuPlacement={'top'}
              onSelect={(value) => {
                setActiveBridges(value);
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
      {isTokenDrawerOpen && (
        <SelectTokenDrawer
          isOpen={isTokenDrawerOpen}
          onClose={onChangeTokenDrawerStatus}
          onCurrencySelect={() => {
            console.log('onCurrencySelect');
          }}
        />
      )}
    </Wrapper>
  );
};

export default BridgeCard;
