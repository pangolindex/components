import { Drawer } from '@honeycomb-finance/core';
import { useChainId, useTranslation } from '@honeycomb-finance/shared';
import { Pair } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { useGetUserLPHook } from 'src/hooks/wallet/hooks';
import PoolRow from './PoolRow';
import { CurrencyList } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPoolSelect: (pair: Pair) => void;
  selectedPair?: Pair | null;
}

const SelectPoolDrawer: React.FC<Props> = (props) => {
  const { isOpen, onClose, onPoolSelect, selectedPair } = props;
  const { t } = useTranslation();
  const chainId = useChainId();
  // fetch the user's balances of all tracked V2 LP tokens
  const useGetUserLP = useGetUserLPHook[chainId];
  const { allV2PairsWithLiquidity } = useGetUserLP();

  const onSelect = useCallback(
    (pair) => {
      onPoolSelect(pair);
      onClose();
    },
    [onPoolSelect, onClose],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const pair: Pair = data?.[index];
      const isSelected = selectedPair?.liquidityToken === pair?.liquidityToken;

      return pair ? <PoolRow style={style} pair={pair} isSelected={isSelected} onSelect={onSelect} /> : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPair, onPoolSelect, onClose, onSelect],
  );

  return (
    <Drawer title={t('searchModal.selectToken')} isOpen={isOpen} onClose={onClose}>
      <CurrencyList>
        <AutoSizer disableWidth>
          {({ height }) => (
            <FixedSizeList
              height={height}
              width="100%"
              itemCount={allV2PairsWithLiquidity.length}
              itemSize={56}
              itemData={allV2PairsWithLiquidity}
              itemKey={(index) => index}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </CurrencyList>
    </Drawer>
  );
};
export default SelectPoolDrawer;
