import React, { useState } from 'react';
import { ZERO_ADDRESS } from 'src/constants';
import LimitOrder from './LimitOrder';
import MarketOrder from './MarketOrder';
import { Root } from './styled';

export interface Props {
  isLimitOrderVisible?: boolean;
  showSettings?: boolean;
  partnerDaaS?: string;
  widgetBackground?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  btnPrimaryBgColor?: string;
  btnPrimaryTextColor?: string;
  btnConfirmedBgColor?: string;
  btnConfirmedTextColor?: string;
  btnDisabledBgColor?: string;
  btnDisabledTextColor?: string;
  settingsBtnBgColor?: string;
  selectPrimaryBgColor?: string;
  selectSecondaryBgColor?: string;
  toggleBgColor?: string;
  toggleSelectedColor?: string;
  toggleTextColor?: string;
  inputFieldBgColor?: string;
  switchOnHandleColor?: string;
}

const SwapWidget: React.FC<Props> = ({
  isLimitOrderVisible = false,
  showSettings = true,
  partnerDaaS = ZERO_ADDRESS,
  widgetBackground,
  textPrimaryColor,
  textSecondaryColor,
  btnPrimaryBgColor,
  btnPrimaryTextColor,
  btnConfirmedBgColor,
  btnConfirmedTextColor,
  settingsBtnBgColor,
  selectPrimaryBgColor,
  selectSecondaryBgColor,
  toggleBgColor,
  toggleSelectedColor,
  toggleTextColor,
  inputFieldBgColor,
  switchOnHandleColor,
}) => {
  const [swapType, setSwapType] = useState('MARKET' as string);
  return (
    <Root>
      {swapType === 'LIMIT' ? (
        <LimitOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          widgetBackground={widgetBackground}
          textPrimaryColor={textPrimaryColor}
          textSecondaryColor={textSecondaryColor}
          btnPrimaryBgColor={btnPrimaryBgColor}
          btnPrimaryTextColor={btnPrimaryTextColor}
          btnConfirmedBgColor={btnConfirmedBgColor}
          btnConfirmedTextColor={btnConfirmedTextColor}
          settingsBtnBgColor={settingsBtnBgColor}
          selectPrimaryBgColor={selectPrimaryBgColor}
          selectSecondaryBgColor={selectSecondaryBgColor}
          toggleBgColor={toggleBgColor}
          toggleSelectedColor={toggleSelectedColor}
          toggleTextColor={toggleTextColor}
          inputFieldBgColor={inputFieldBgColor}
        />
      ) : (
        <MarketOrder
          swapType={swapType}
          setSwapType={(type) => {
            setSwapType(type);
          }}
          isLimitOrderVisible={isLimitOrderVisible}
          showSettings={showSettings}
          partnerDaaS={partnerDaaS}
          widgetBackground={widgetBackground}
          textPrimaryColor={textPrimaryColor}
          textSecondaryColor={textSecondaryColor}
          btnPrimaryBgColor={btnPrimaryBgColor}
          btnPrimaryTextColor={btnPrimaryTextColor}
          btnConfirmedBgColor={btnConfirmedBgColor}
          btnConfirmedTextColor={btnConfirmedTextColor}
          settingsBtnBgColor={settingsBtnBgColor}
          selectPrimaryBgColor={selectPrimaryBgColor}
          selectSecondaryBgColor={selectSecondaryBgColor}
          toggleBgColor={toggleBgColor}
          toggleSelectedColor={toggleSelectedColor}
          toggleTextColor={toggleTextColor}
          inputFieldBgColor={inputFieldBgColor}
          switchOnHandleColor={switchOnHandleColor}
        />
      )}
    </Root>
  );
};
export default SwapWidget;
