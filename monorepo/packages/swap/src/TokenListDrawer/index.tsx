import { Box, Button, Drawer, Text, TextInput } from '@pangolindex/core';
import { parseENSAddress, uriToHttp, useTranslation } from '@pangolindex/shared';
import React, { useCallback, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useFetchListCallback } from 'src/hooks/useFetchListCallback';
import { useListsStateAtom } from 'src/state/plists/atom';
import TokenListRow from './TokenListRow';
import { AddInputWrapper, List } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TokenListDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [listUrlInput, setListUrlInput] = useState<string>('');

  const { listsState, removeList } = useListsStateAtom();

  const { t } = useTranslation();
  const lists = listsState?.byUrl;

  const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchList = useFetchListCallback();

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listUrlInput)
      .then(() => {
        setListUrlInput('');
      })
      .catch((error) => {
        setAddError(error.message);
        removeList(listUrlInput);
      });
  }, [adding, removeList, fetchList, listUrlInput]);

  const validUrl = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput));
  }, [listUrlInput]);

  const handleEnterKey = useCallback(
    (e) => {
      if (validUrl && e.key === 'Enter') {
        handleAddList();
      }
    },
    [handleAddList, validUrl],
  );

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists);
    return listUrls
      .filter((listUrl) => {
        return Boolean(lists[listUrl].current);
      })
      .sort((u1, u2) => {
        const { current: l1 } = lists[u1];
        const { current: l2 } = lists[u2];
        if (l1 && l2) {
          return l1.name.toLowerCase() < l2.name.toLowerCase()
            ? -1
            : l1.name.toLowerCase() === l2.name.toLowerCase()
            ? 0
            : 1;
        }
        if (l1) return -1;
        if (l2) return 1;
        return 0;
      });
  }, [lists, listsState]);

  return (
    <Drawer title={t('searchModal.manageLists')} isOpen={isOpen} onClose={onClose}>
      {/* Render Search Token Input */}
      <Box padding="0px 20px">
        <AddInputWrapper>
          <TextInput
            placeholder="https:// or ipfs://"
            onChange={(value: any) => {
              setListUrlInput(value as string);
              setAddError(null);
            }}
            onKeyDown={handleEnterKey}
            value={listUrlInput}
          />
          <Button variant="primary" padding={'0px'} isDisabled={!validUrl} onClick={handleAddList} height="50px">
            {t('searchModal.add')}
          </Button>
        </AddInputWrapper>

        {addError ? (
          <Text title={addError} color="error" fontSize={12}>
            {addError}
          </Text>
        ) : null}
      </Box>
      <Scrollbars>
        <List>
          {sortedLists.map((url) => (
            <TokenListRow listUrl={url} key={url} />
          ))}
        </List>
      </Scrollbars>
    </Drawer>
  );
};
export default TokenListDrawer;
