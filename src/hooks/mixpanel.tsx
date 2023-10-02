import mixpanel from 'mixpanel-browser';
import React, { FC, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export enum MixPanelEvents {
  WALLET_CONNECT = 'Wallet Connected',
  SWAP = 'Swap',
  NEWS = 'Interacted with News',
  ADD_LIQUIDITY = 'Added Liquidity',
  INCREASE_LIQUIDITY = 'Increased Liquidity',
  JOIN = 'Join Vault',
  REMOVE_LIQUIDITY = 'Removed Liquidity',
  ADD_FARM = 'Added to farm',
  REMOVE_FARM = 'Removed from farm',
  CLAIM_REWARDS = 'Claimed rewards',
  COMPOUND_REWARDS = 'Compound farm',
  SAR_STAKE = 'Staked in SAR',
  LIMIT_ORDER = 'Limit Order Placed',
  SHOW_BALANCES = 'Shown Balance',
  HIDE_BALANCES = 'Hidden Balance',
  ADD_WATCHLIST = 'Added Token in Watchlist',
  REMOVE_WATCHLIST = 'Removed Token from Watchlist',
  CLAIM_AIRDROP = 'Claimed Airdrop',
}

interface MixPanelProviderProps {
  children: ReactNode;
  mixpanelToken?: string;
}

type MixPanelContextType = {
  track: (event: MixPanelEvents, properties: { [x: string]: any }) => void;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
const dummyTrack = (event: MixPanelEvents, properties: { [x: string]: any }) => {
  // This is intentional
};

export const MixPanelContext = createContext<MixPanelContextType>({ track: dummyTrack });

export const MixPanelProvider: FC<MixPanelProviderProps> = ({ children, mixpanelToken }: MixPanelProviderProps) => {
  const [activedMixPanel, setActivedMixPanel] = useState(false);

  useEffect(() => {
    if (mixpanelToken) {
      try {
        mixpanel.init(mixpanelToken);
        setActivedMixPanel(true);
      } catch (error) {
        console.error('Error activating Mixpanel: ', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const track = useCallback((event: MixPanelEvents, properties: { [x: string]: any }) => {
    mixpanel.track(event, { source: 'pangolin-components', ...properties });
  }, []);

  const state: MixPanelContextType = useMemo(() => {
    return {
      track: activedMixPanel ? track : dummyTrack,
    };
  }, [activedMixPanel, track]);

  return <MixPanelContext.Provider value={state}>{children}</MixPanelContext.Provider>;
};

export function useMixpanel() {
  return useContext(MixPanelContext);
}
