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
}

const TradeOption: React.FC<Props> = ({
  swapType,
  setSwapType,
  isLimitOrderVisible,
  showSettings = false,
  openSwapSettings = () => {},
}) => {
  return (
    <SwapWrapper>
      {/* <SwapAlertBox>This is a BETA release and should be used at your own risk!</SwapAlertBox> */}

      <Box p={10}>
        <Box display="flex" alignItems="center" style={{ gap: '6px' }}>
          <Text color="text1" fontSize={24} fontWeight={500} style={{ flexGrow: 1 }}>
            Trade
          </Text>
          {showSettings && swapType === 'MARKET' && (
            <SettingsButton onClick={openSwapSettings}>
              <Settings size={20} />
            </SettingsButton>
          )}
          {isLimitOrderVisible && (
            <Box width="130px">
              <ToggleButtons
                options={['MARKET', 'LIMIT']}
                value={swapType}
                onChange={(value) => {
                  setSwapType(value);
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </SwapWrapper>
  );
};
export default TradeOption;
