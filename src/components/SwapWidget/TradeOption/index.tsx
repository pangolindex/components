import React, { useMemo } from 'react';
import { Settings } from 'react-feather';
import { SwapTypes } from 'src/constants';
import { Box, Text, ToggleButtons } from '../../';
import { SettingsButton } from '../Settings/styled';
import { SwapWrapper } from './styled';

interface Props {
  swapType: string;
  setSwapType: (value: SwapTypes) => void;
  isLimitOrderVisible: boolean;
  isTWAPOrderVisible: boolean;
  showSettings?: boolean;
  openSwapSettings?: () => void;
}
const TradeOption: React.FC<Props> = ({
  swapType,
  setSwapType,
  isLimitOrderVisible,
  isTWAPOrderVisible,
  showSettings = false,
  openSwapSettings = () => {},
}) => {
  const options = useMemo(() => {
    const options = [SwapTypes.MARKET];
    if (isLimitOrderVisible) options.push(SwapTypes.LIMIT);
    if (isTWAPOrderVisible) options.push(SwapTypes.TWAP);
    return options;
  }, [isLimitOrderVisible, isTWAPOrderVisible]);

  return (
    <SwapWrapper>
      <Box p={10}>
        <Box display="flex" alignItems="center" style={{ gap: '6px' }}>
          <Text color="swapWidget.primary" fontSize={24} fontWeight={500} style={{ flexGrow: 1 }}>
            Trade
          </Text>
          {showSettings && swapType === 'MARKET' && (
            <SettingsButton onClick={openSwapSettings}>
              <Settings size={20} />
            </SettingsButton>
          )}
          {options.length > 1 && (
            <Box>
              <ToggleButtons
                options={options}
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
