import { Web3Provider } from '@ethersproject/providers';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import { CHAINS } from '@pangolindex/sdk';
import { ZERO_ADDRESS, isEvmChain, useChainId, useLibrary, usePangolinWeb3 } from '@pangolindex/shared';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { SwapTypes } from 'src/constants';
import LimitOrder from './components/LimitOrder';
import MarketOrder from './components/MarketOrder';
import TWAP from './components/TWAP/TWAPPanel';
import { galetoStore } from './state';
import SwapUpdater from './state/updater';
import { Root } from './styled';
export interface SwapWidgetProps {
  onSwapTypeChange?: React.Dispatch<React.SetStateAction<SwapTypes>>;
  isLimitOrderVisible?: boolean;
  isTWAPOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
  defaultInputToken?: string;
  defaultOutputToken?: string;
}

const SwapWidget: React.FC<SwapWidgetProps> = ({
  isLimitOrderVisible = false,
  isTWAPOrderVisible = false,
  onSwapTypeChange,
  showSettings = true,
  partnerDaaS = ZERO_ADDRESS,
  defaultInputToken,
  defaultOutputToken,
}) => {
  const chainId = useChainId();
  const { account } = usePangolinWeb3();
  const { library } = useLibrary();
  const [swapType, setSwapType] = useState(SwapTypes.MARKET);

  const render = () => {
    if (swapType === SwapTypes.LIMIT) {
      return (
        <LimitOrder
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          isTWAPOrderVisible={isTWAPOrderVisible}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
        />
      );
    } else if (swapType === SwapTypes.TWAP) {
      return (
        <TWAP
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          isTWAPOrderVisible={isTWAPOrderVisible}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
          partnerDaaS={partnerDaaS}
        />
      );
    } else
      return (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type: SwapTypes) => {
            setSwapType(type);
            onSwapTypeChange && onSwapTypeChange(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          isTWAPOrderVisible={isTWAPOrderVisible}
          showSettings={showSettings}
          partnerDaaS={partnerDaaS}
          defaultInputAddress={defaultInputToken}
          defaultOutputAddress={defaultOutputToken}
        />
      );
  };

  const ethersLibrary = library && !library?._isProvider ? new Web3Provider(library) : library;

  return (
    <Root>
      <SwapUpdater />

      {isEvmChain(chainId) && CHAINS[chainId]?.supported_by_gelato ? (
        <Provider store={galetoStore}>
          <GelatoProvider
            library={ethersLibrary}
            chainId={chainId}
            account={account ?? undefined}
            useDefaultTheme={false}
            handler={'pangolin'}
          >
            {render()}
          </GelatoProvider>
        </Provider>
      ) : (
        render()
      )}
    </Root>
  );
};
export { SwapWidget };
