import React, { useCallback, useRef, useState } from 'react';
import { ChevronDown } from 'react-feather';
import ReactGA from 'react-ga';
import { useOnClickOutside } from 'src/hooks/useOnClickOutside';
import { AppState, useDispatch, useSelector } from 'src/state';
import { removeList, selectList } from 'src/state/plists/actions';
import { useSelectedListUrl } from 'src/state/plists/hooks';
import listVersionLabel from 'src/utils/listVersionLabel';
import { Box, Switch, Text } from '../../';
import TokenListOrigin from '../TokenListOrigin';
import { DownArrow, ListLogo, PopoverContainer, RowRoot, Separator, ViewLink } from './styled';

interface Props {
  listUrl: string;
}

const TokenListRow: React.FC<Props> = ({ listUrl }) => {
  const lists = useSelector<AppState['plists']['byUrl']>((state) => state.plists.byUrl);
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
    // eslint-disable-next-line import/no-named-as-default-member
    ReactGA.event({
      category: 'Lists',
      action: 'Select List',
      label: listUrl,
    });

    dispatch(selectList({ url: listUrl, shouldSelect: !isSelected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isSelected, listUrl]);

  const handleRemoveList = useCallback(() => {
    // eslint-disable-next-line import/no-named-as-default-member
    ReactGA.event({
      category: 'Lists',
      action: 'Start Remove List',
      label: listUrl,
    });

    const answer = window.prompt('Please confirm you would like to remove this list by typing "remove"');
    if (answer?.toLocaleLowerCase() === 'remove') {
      // eslint-disable-next-line import/no-named-as-default-member
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
              View list
            </ViewLink>
            <ViewLink
              fontSize={13}
              color="swapWidget.primary"
              onClick={handleRemoveList}
              disabled={Object.keys(lists).length === 1}
            >
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
