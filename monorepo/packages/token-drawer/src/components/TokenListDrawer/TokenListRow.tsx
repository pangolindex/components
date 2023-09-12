import { Box, Switch, Text } from '@honeycomb/core';
import { listVersionLabel, useOnClickOutside, useTranslation } from '@honeycomb/shared';
import { useListsStateAtom, useSelectedListUrl } from '@honeycomb/state-hooks';
import React, { useCallback, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import TokenListOrigin from '../TokenListOrigin';
import { DownArrow, ListLogo, PopoverContainer, RowRoot, Separator, ViewLink } from './styled';

interface Props {
  listUrl: string;
}

const TokenListRow: React.FC<Props> = ({ listUrl }) => {
  const { listsState, removeList, selectList } = useListsStateAtom();
  const lists = listsState?.byUrl;

  const { current: list } = lists[listUrl];
  const { t } = useTranslation();
  const selectedListUrl = useSelectedListUrl();
  const isSelected = (selectedListUrl || []).includes(listUrl);

  const [open, setOpen] = useState<boolean>(false);

  const node = useRef<HTMLDivElement>();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useOnClickOutside(node, open ? handleClose : undefined);

  const selectThisList = useCallback(() => {
    selectList({ url: listUrl, shouldSelect: !isSelected });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectList, isSelected, listUrl]);

  const handleRemoveList = useCallback(() => {
    const answer = window.prompt(`${t('searchModal.confirmListRemovalPrompt')}`);
    if (answer?.toLocaleLowerCase() === 'remove') {
      removeList(listUrl);
    }
  }, [listUrl, removeList]);

  if (!list) return null;

  return (
    <RowRoot>
      {list?.logoURI ? <ListLogo size={24} src={list?.logoURI} /> : <ListLogo as="div" size={24} />}
      <Box>
        <Text fontSize={16} color="swapWidget.primary" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {list?.name}
        </Text>
        <Text
          fontSize={12}
          color="swapWidget.secondary"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          title={listUrl}
        >
          <TokenListOrigin listUrl={listUrl} />
        </Text>
      </Box>
      <Box ref={node as any}>
        <DownArrow onClick={() => setOpen(!open)}>
          <ChevronDown />
        </DownArrow>
        {open && (
          <PopoverContainer>
            <div>{list && listVersionLabel(list.version)}</div>
            <Separator />
            <ViewLink
              fontSize={13}
              as="a"
              color="swapWidget.primary"
              href={`https://tokenlists.org/token-list?url=${listUrl}`}
              target="_blank"
            >
              {t('searchModal.viewList')}
            </ViewLink>
            <ViewLink
              fontSize={13}
              color="swapWidget.primary"
              onClick={handleRemoveList}
              disabled={Object.keys(lists).length === 1}
            >
              {t('searchModal.removeList')}
            </ViewLink>
          </PopoverContainer>
        )}
      </Box>
      <Switch checked={isSelected} onChange={() => selectThisList()} />
    </RowRoot>
  );
};

export default TokenListRow;
