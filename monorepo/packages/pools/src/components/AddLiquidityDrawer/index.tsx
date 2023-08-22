import { Token } from '@pangolindex/sdk';
import React from 'react';
import AddLiquidity from '../AddLiquidity';
import { useTranslation } from 'react-i18next';
import { unwrappedToken, useChainId } from '@pangolindex/shared';
import { SpaceType } from 'src/hooks/minichef/types';
import { Drawer } from '@pangolindex/core';

type Props = {
  isOpen: boolean;
  clickedLpTokens: Array<Token>;
  onClose: () => void;
  onAddToFarm?: () => void;
  backgroundColor?: string;
};

const AddLiquidityDrawer: React.FC<Props> = ({ isOpen, onClose, onAddToFarm, clickedLpTokens, backgroundColor }) => {
  const { t } = useTranslation();
  const chainId = useChainId();

  const token0 = clickedLpTokens?.[0];
  const token1 = clickedLpTokens?.[1];

  const currencyA = token0 && unwrappedToken(token0, chainId);
  const currencyB = token1 && unwrappedToken(token1, chainId);

  return (
    <Drawer title={t('pool.addLiquidity')} isOpen={isOpen} onClose={onClose} backgroundColor={backgroundColor}>
      {isOpen && (
        <AddLiquidity
          currencyA={currencyA}
          currencyB={currencyB}
          onComplete={onClose}
          onAddToFarm={onAddToFarm}
          type={SpaceType.card}
        />
      )}
    </Drawer>
  );
};

export default AddLiquidityDrawer;
