import mixpanel from 'mixpanel-browser';
import React, { FC, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface MixPanelProviderProps {
  children: ReactNode;
  mixpanelToken?: string;
}

type MixPanelContext = {
  track: (event: string, properties: { [x: string]: any }) => void;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
const dummyTrack = (event: string, properties: { [x: string]: any }) => {};

export const MixPanelContext = createContext<MixPanelContext>({ track: dummyTrack });

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
  }, []);

  const track = useCallback((event: string, properties: { [x: string]: any }) => {
    mixpanel.track(event, { ...properties, source: 'pangolin-components' });
  }, []);

  const state: MixPanelContext = useMemo(() => {
    return {
      track: activedMixPanel ? track : dummyTrack,
    };
  }, [activedMixPanel]);

  return <MixPanelContext.Provider value={state}>{children}</MixPanelContext.Provider>;
};

export function useMixpanel() {
  return useContext(MixPanelContext);
}
