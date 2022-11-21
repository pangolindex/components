import React, { useCallback, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import ReactGA from 'react-ga';
import Drawer from 'src/components/Drawer';
import { useFetchListCallback } from 'src/hooks/useFetchListCallback';
import { AppState, useDispatch, useSelector } from 'src/state';
import { removeList } from 'src/state/plists/actions';
import { parseENSAddress } from 'src/utils/parseENSAddress';
import uriToHttp from 'src/utils/uriToHttp';
import { Box, Button, Text, TextInput } from '../../';
import TokenListRow from './TokenListRow';
import { AddInputWrapper, List } from './styled';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TokenListDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [listUrlInput, setListUrlInput] = useState<string>('');
  const dispatch = useDispatch();
  const lists = useSelector<AppState['plists']['byUrl']>((state) => state.plists.byUrl);
  const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchList = useFetchListCallback();

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listUrlInput)
      .then(() => {
        setListUrlInput('');
        // eslint-disable-next-line import/no-named-as-default-member
        ReactGA.event({
          category: 'Lists',
          action: 'Add List',
          label: listUrlInput,
        });
      })
      .catch((error) => {
        // eslint-disable-next-line import/no-named-as-default-member
        ReactGA.event({
          category: 'Lists',
          action: 'Add List Failed',
          label: listUrlInput,
        });
        setAddError(error.message);
        dispatch(removeList(listUrlInput));
      });
  }, [adding, dispatch, fetchList, listUrlInput]);

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
  }, [lists]);

  return (
    <Drawer title="Manage Lists" isOpen={isOpen} onClose={onClose}>
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
            Add
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
