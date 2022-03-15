import { Text, Switch, Box } from '../../';
import React, { useCallback, useState, useRef } from 'react';
import ReactGA from 'react-ga';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown } from 'react-feather';
import { AppState } from 'src/state';
import { useSelectedListUrl } from 'src/state/plists/hooks';
import { selectList, removeList } from 'src/state/plists/actions';
import TokenListOrigin from '../TokenListOrigin';
import { ListLogo, RowRoot, DownArrow, PopoverContainer, Separator, ViewLink } from './styled';
import { useOnClickOutside } from 'src/hooks/useOnClickOutside';
import listVersionLabel from 'src/utils/listVersionLabel';

interface Props {
  listUrl: string;
}

const TokenListRow: React.FC<Props> = ({ listUrl }) => {
  const lists = useSelector<AppState, AppState['plists']['byUrl']>((state) => state.plists.byUrl);
  const { current: list } = lists[listUrl];

  const dispatch = useDispatch();
  const selectedListUrl = useSelectedListUrl();
  const isSelected = (selectedListUrl || []).includes(listUrl);

  const [open, setOpen] = useState<boolean>(false);

  const node = useRef<HTMLDivElement>();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useOnClickOutside(node, open ? handleClose : undefined);

  const selectThisList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Select List',
      label: listUrl,
    });

    dispatch(selectList({ url: listUrl, shouldSelect: !isSelected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isSelected, listUrl]);

  const handleRemoveList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Start Remove List',
      label: listUrl,
    });

    if (window.prompt('Please confirm you would like to remove this list by typing REMOVE') === 'remove') {
      ReactGA.event({
        category: 'Lists',
        action: 'Confirm Remove List',
        label: listUrl,
      });
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl]);

  if (!list) return null;

  return (
    <RowRoot>
      {list?.logoURI ? <ListLogo size={24} src={list?.logoURI} /> : <ListLogo as="div" size={24} />}
      <Box>
        <Text fontSize={16} color="text1" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {list?.name}
        </Text>
        <Text fontSize={12} color="text3" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={listUrl}>
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
              color="text1"
              href={`https://tokenlists.org/token-list?url=${listUrl}`}
              target="_blank"
            >
              View list
            </ViewLink>
            <ViewLink fontSize={13} color="text1" onClick={handleRemoveList} disabled={Object.keys(lists).length === 1}>
              Remove list
            </ViewLink>
          </PopoverContainer>
        )}
      </Box>
      <Switch checked={isSelected} onChange={() => selectThisList()} />
    </RowRoot>
  );
};

export default TokenListRow;
