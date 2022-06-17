import React from 'react';
import { Eye, EyeOff } from 'react-feather';
import { Text } from '../Text';
import { HideButton } from './styleds';

interface Props {
  showBalances: boolean;
  handleShowBalances: () => void;
}

const ToggleBalanceButton: React.FC<Props> = ({ showBalances, handleShowBalances }) => {
  return (
    <HideButton onClick={handleShowBalances}>
      {showBalances ? (
        <>
          <EyeOff size={12} id="portfolio-icon" />
          <Text fontSize={['8px', '10px', '12px']} id="portfolio-text" style={{ marginLeft: '5px' }}>
            Hide Your Balance
          </Text>
        </>
      ) : (
        <>
          <Eye size={12} id="portfolio-icon" />
          <Text fontSize={12} id="portfolio-text" style={{ marginLeft: '5px' }}>
            Show Your Balance
          </Text>
        </>
      )}
    </HideButton>
  );
};
export default ToggleBalanceButton;
