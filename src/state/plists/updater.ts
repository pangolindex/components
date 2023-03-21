import { VersionUpgrade, getVersionUpgrade, minVersionBump } from '@pangolindex/token-lists';
import { useCallback, useEffect } from 'react';
import { DEFAULT_TOKEN_LISTS } from 'src/constants/lists';
import { useLibrary } from 'src/hooks';
import { useFetchListCallback } from 'src/hooks/useFetchListCallback';
import useInterval from 'src/hooks/useInterval';
import useIsWindowVisible from 'src/hooks/useIsWindowVisible';
import { useListsStateAtom } from './atom';

export default function Updater(): null {
  const { library } = useLibrary();

  const { listsState, acceptListUpdate } = useListsStateAtom();
  const lists = listsState?.byUrl;

  const isWindowVisible = useIsWindowVisible();

  const fetchList = useFetchListCallback();

  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    Object.keys(lists).forEach((url) =>
      fetchList(url).catch((error) => console.debug('interval list fetching error', error)),
    );
  }, [fetchList, isWindowVisible, lists]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];

      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) => console.debug('list added fetching error', error));
      }
    });
  }, [fetchList, library, lists]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version);

        const isDefaultList = DEFAULT_TOKEN_LISTS.includes(listUrl);

        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error('unexpected no version bump');
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
            const min = minVersionBump(list.current.tokens, list.pendingUpdate.tokens);
            // automatically update minor/patch as long as bump matches the min update
            if (bump >= min) {
              if (isDefaultList) {
                //if its pangolin hosted token list then we will autoupdate it
                acceptListUpdate(listUrl);
              } else {
                //show prompts for user added token list
                // dispatch(
                //   addPopup({
                //     key: listUrl,
                //     content: {
                //       listUpdate: {
                //         listUrl,
                //         oldList: list.current,
                //         newList: list.pendingUpdate,
                //         auto: true
                //       }
                //     }
                //   })
                // )
              }
            } else {
              console.error(
                `List at url ${listUrl} could not automatically update because the version bump was only PATCH/MINOR while the update had breaking changes and should have been MAJOR`,
              );
            }
            break;

          case VersionUpgrade.MAJOR:
            if (isDefaultList) {
              // if its pangolin hosted token list then we will autoupdate it
              acceptListUpdate(listUrl);
            } else {
              // show prompts for user added token list
              // dispatch(
              //   addPopup({
              //     key: listUrl,
              //     content: {
              //       listUpdate: {
              //         listUrl,
              //         auto: false,
              //         oldList: list.current,
              //         newList: list.pendingUpdate
              //       }
              //     },
              //     removeAfterMs: null
              //   })
              // )
            }
        }
      }
    });
  }, [lists]);

  return null;
}
