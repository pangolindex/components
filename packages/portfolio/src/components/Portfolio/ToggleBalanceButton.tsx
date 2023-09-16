import { Text } from '@honeycomb-finance/core';
import { useTranslation } from '@honeycomb-finance/shared';
import React from 'react';
import { Eye, EyeOff } from 'react-feather';
import { HideButton } from './styleds';

interface Props {
  showBalances: boolean;
  handleShowBalances: () => void;
}

const ToggleBalanceButton: React.FC<Props> = ({ showBalances, handleShowBalances }) => {
  const { t } = useTranslation();

  return (
    <HideButton onClick={handleShowBalances}>
      {showBalances ? (
        <>
          <EyeOff size={12} id="portfolio-icon" />
          <Text fontSize={['8px', '10px', '12px']} id="portfolio-text" style={{ marginLeft: '5px' }}>
            {t('portfolio.hideYourBalance')}
          </Text>
        </>
      ) : (
        <>
          <Eye size={12} id="portfolio-icon" />
          <Text fontSize={12} id="portfolio-text" style={{ marginLeft: '5px' }}>
            {t('portfolio.showYourBalance')}
          </Text>
        </>
      )}
    </HideButton>
  );
};
export default ToggleBalanceButton;
