import { BridgeChain, Chain, currencyEquals } from '@pangolindex/sdk';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import Drawer from 'src/components/Drawer';
import usePrevious from 'src/hooks/usePrevious';
import { filterTokenOrChain } from 'src/utils';
import { Box, TextInput } from '..';
import ChainRow from './ChainRow';
import { ChainList } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onChainSelect: (chain: Chain) => void;
  chains?: BridgeChain[];
  selectedChain?: BridgeChain;
  otherSelectedChain?: BridgeChain;
}

const SelectChainDrawer: React.FC<Props> = (props) => {
  const { isOpen, onClose, onChainSelect, chains, otherSelectedChain, selectedChain } = props;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const lastOpen = usePrevious(isOpen);

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filteredChains: BridgeChain[] = useMemo(() => {
    return filterTokenOrChain(chains || [], searchQuery) as BridgeChain[];
  }, [chains, searchQuery]);

  const filteredSortedChains: BridgeChain[] = useMemo(() => {
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);
    if (symbolMatch.length > 1) return filteredChains;
    return [
      ...filteredChains.filter((chain) => chain.symbol?.toLowerCase() === symbolMatch[0]),
      ...filteredChains.filter((chain) => chain.symbol?.toLowerCase() !== symbolMatch[0]),
    ];
  }, [filteredChains, searchQuery]);

  const data = useMemo(() => {
    return filteredSortedChains;
  }, [filteredSortedChains]);

  const onSelect = useCallback(
    (chain) => {
      onChainSelect(chain);
      onClose();
    },
    [onChainSelect, onClose],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const chain: Chain = data?.[index];
      const isSelected = Boolean(selectedChain && currencyEquals(selectedChain?.nativeCurrency, chain?.nativeCurrency));
      const otherSelected = Boolean(
        otherSelectedChain && currencyEquals(otherSelectedChain?.nativeCurrency, chain?.nativeCurrency),
      );

      return chain ? (
        <ChainRow
          style={style}
          chain={chain}
          isSelected={isSelected}
          onSelect={onSelect}
          otherSelected={otherSelected}
        />
      ) : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedChain, otherSelectedChain, onChainSelect, onClose],
  );

  return (
    <Drawer px={30} pb={30} pt={30} title="Select a chain" isOpen={isOpen} onClose={onClose}>
      {/* Render Search Chain Input */}
      <Box padding="0px 30px">
        <TextInput
          placeholder="Search"
          onChange={(value: any) => {
            setSearchQuery(value as string);
          }}
          value={searchQuery}
          getRef={(ref: HTMLInputElement) => ((inputRef as any).current = ref)}
          onClick={() => {
            if (isMobile) {
              inputRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </Box>
      {/* Render All Selected Chains */}
      <ChainList>
        <AutoSizer disableWidth>
          {({ height }) => (
            <FixedSizeList
              height={height}
              width="100%"
              itemCount={data.length}
              itemSize={56}
              itemData={data}
              itemKey={(index, data) => data[index].id}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </ChainList>
    </Drawer>
  );
};

export default memo(SelectChainDrawer, (prevProps, nextProps) => {
  const isEqual =
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onChainSelect === nextProps.onChainSelect &&
    (!!prevProps.selectedChain && !!nextProps.selectedChain
      ? prevProps.selectedChain.symbol === nextProps.selectedChain.symbol
      : true) &&
    (!!prevProps.otherSelectedChain && !!nextProps.otherSelectedChain
      ? prevProps.otherSelectedChain.symbol === nextProps.otherSelectedChain.symbol
      : true);
  return isEqual;
});
