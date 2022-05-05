import React from 'react';
import { Box, Text, ToggleButtons } from '../../';
import { SwapWrapper } from './styled';

interface Props {
  swapType: string;
  setSwapType: (value: string) => void;
  isLimitOrderVisible: boolean;
}

const TradeOption: React.FC<Props> = ({ swapType, setSwapType, isLimitOrderVisible }) => {
  return (
    <SwapWrapper>
      {/* <SwapAlertBox>This is a BETA release and should be used at your own risk!</SwapAlertBox> */}

      <Box p={10}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Text color="text1" fontSize={24} fontWeight={500}>
            Trade
          </Text>
          {isLimitOrderVisible && (
            <ToggleButtons
              options={['MARKET', 'LIMIT']}
              value={swapType}
              onChange={(value) => {
                setSwapType(value);
              }}
            />
          )}
        </Box>
      </Box>
    </SwapWrapper>
  );
};
export default TradeOption;
