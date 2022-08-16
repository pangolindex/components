import React from 'react';
import { Settings } from 'react-feather';
import { Box, Text, ToggleButtons } from '../../';
import { SettingsButton } from '../Settings/styled';
import { SwapWrapper } from './styled';

interface Props {
  swapType: string;
  setSwapType: (value: string) => void;
  isLimitOrderVisible: boolean;
  showSettings?: boolean;
  openSwapSettings?: () => void;
  widgetBackground?: string;
  textPrimaryColor?: string;
  btnDisabledBgColor?: string;
  settingsBtnBgColor?: string;
  toggleBgColor?: string;
  toggleSelectedColor?: string;
  toggleTextColor?: string;
}

const TradeOption: React.FC<Props> = ({
  swapType,
  setSwapType,
  isLimitOrderVisible,
  showSettings = false,
  openSwapSettings = () => {},
  widgetBackground,
  textPrimaryColor,
  btnDisabledBgColor,
  settingsBtnBgColor,
  toggleBgColor,
  toggleSelectedColor,
  toggleTextColor,
}) => {
  return (
    <SwapWrapper style={widgetBackground ? { backgroundColor: widgetBackground } : {}}>
      {/* <SwapAlertBox>This is a BETA release and should be used at your own risk!</SwapAlertBox> */}

      <Box p={10}>
        <Box display="flex" alignItems="center" style={{ gap: '6px' }}>
          <Text color="text1" fontSize={24} fontWeight={500} style={{ flexGrow: 1, color: textPrimaryColor }}>
            Trade
          </Text>
          {showSettings && swapType === 'MARKET' && (
            <SettingsButton
              onClick={openSwapSettings}
              style={settingsBtnBgColor ? { backgroundColor: settingsBtnBgColor } : {}}
            >
              <Settings size={20} />
            </SettingsButton>
          )}
          {isLimitOrderVisible && (
            <Box width="130px" style={btnDisabledBgColor ? { background: btnDisabledBgColor } : {}}>
              <ToggleButtons
                options={['MARKET', 'LIMIT']}
                value={swapType}
                onChange={(value) => {
                  setSwapType(value);
                }}
                toggleBgColor={toggleBgColor}
                toggleSelectedColor={toggleSelectedColor}
                toggleTextColor={toggleTextColor}
              />
            </Box>
          )}
        </Box>
      </Box>
    </SwapWrapper>
  );
};
export default TradeOption;
