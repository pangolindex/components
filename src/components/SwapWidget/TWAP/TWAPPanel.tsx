import { TWAP as PangolinTWAP } from '@orbs-network/twap-ui-pangolin';
import React, { useCallback, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { SwapTypes, ZERO_ADDRESS } from 'src/constants';
import { useChainId, usePangolinWeb3 } from 'src/hooks';
import { useAllTokens } from 'src/hooks/Tokens';
import { useWalletModalToggle } from 'src/state/papplication/hooks';
import { Field } from '../../../state/pswap/actions';
import { useSwapActionHandlers } from '../../../state/pswap/hooks';
import SelectTokenDrawer from '../SelectTokenDrawer';
import TradeOption from '../TradeOption';
import { Root } from '../styled';

export interface SwapWidgetProps {
  defaultInputAddress?: string;
  defaultOutputAddress?: string;
  swapType: string;
  setSwapType: (value: SwapTypes) => void;
  isLimitOrderVisible: boolean;
  isTWAPOrderVisible: boolean;
  partnerDaaS: string;
}

function TWAP({
  defaultInputAddress,
  defaultOutputAddress,
  swapType,
  setSwapType,
  isLimitOrderVisible,
  isTWAPOrderVisible,
  partnerDaaS,
}: SwapWidgetProps) {
  const { account, library } = usePangolinWeb3();
  const chainId = useChainId();
  const theme = useContext(ThemeContext);
  const toggleWalletModal = useWalletModalToggle();
  const allTokens = useAllTokens();
  const { onCurrencySelection } = useSwapActionHandlers(chainId);

  const onSrcSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.INPUT, token);
    },
    [onCurrencySelection],
  );

  const onDstSelect = useCallback(
    (token: any) => {
      onCurrencySelection(Field.OUTPUT, token);
    },
    [onCurrencySelection],
  );

  return (
    <Root>
      <TradeOption
        isTWAPOrderVisible={isTWAPOrderVisible}
        swapType={swapType}
        setSwapType={setSwapType}
        isLimitOrderVisible={isLimitOrderVisible}
      />
      <PangolinTWAP
        connect={toggleWalletModal}
        connectedChainId={chainId}
        provider={library?.provider}
        account={account}
        dappTokens={allTokens}
        srcToken={defaultInputAddress}
        dstToken={defaultOutputAddress}
        TokenSelectModal={SelectTokenDrawer}
        theme={theme}
        partnerDaas={partnerDaaS === ZERO_ADDRESS ? undefined : partnerDaaS}
        onSrcTokenSelected={onSrcSelect}
        onDstTokenSelected={onDstSelect}
      />
    </Root>
  );
}

export default TWAP;
