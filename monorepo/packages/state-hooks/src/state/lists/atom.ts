import { DEFAULT_TOKEN_LISTS, DEFAULT_TOKEN_LISTS_SELECTED } from '@pangolindex/shared';
import { VersionUpgrade, getVersionUpgrade } from '@pangolindex/token-lists';
// eslint-disable-next-line import/no-unresolved
import { TokenList } from '@pangolindex/token-lists/dist/types';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';

export interface ListsState {
  byUrl: {
    [url: string]: {
      current: TokenList | null;
      pendingUpdate: TokenList | null;
      loadingRequestId: string | null;
      error: string | null;
    };
  };
  // this contains the default list of lists from the last time the updateVersion was called, i.e. the app was reloaded
  lastInitializedDefaultListOfLists?: string[];
  selectedListUrl: string[] | undefined;
}

type ListState = ListsState['byUrl'][string];

const NEW_LIST_STATE: ListState = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null,
};

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P] };

const initialState: ListsState = {
  lastInitializedDefaultListOfLists: DEFAULT_TOKEN_LISTS,
  byUrl: {
    ...DEFAULT_TOKEN_LISTS.reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
      memo[listUrl] = NEW_LIST_STATE;
      return memo;
    }, {}),
  },
  selectedListUrl: DEFAULT_TOKEN_LISTS_SELECTED,
};

const localstorageKey = 'lists_pangolin';
const listsStateAtom = atomWithStorage<ListsState>(localstorageKey, initialState);

export const useListsStateAtom = () => {
  const [listsState, setListsState] = useAtom(listsStateAtom);

  const pendingFetchTokenList = useCallback(
    ({ requestId, url }: { requestId: string; url: string }) => {
      setListsState((prevState) => ({
        ...prevState,
        byUrl: {
          ...prevState.byUrl,
          [url]: {
            // eslint-disable-next-line  @typescript-eslint/ban-ts-comment
            // @ts-ignore
            current: null,

            // eslint-disable-next-line  @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pendingUpdate: null,
            ...prevState.byUrl[url],
            loadingRequestId: requestId,
            error: null,
          },
        },
      }));
    },
    [setListsState],
  );

  const fulfilledFetchTokenList = useCallback(
    ({ requestId, tokenList, url }: { requestId: string; tokenList: TokenList; url: string }) => {
      const current = listsState.byUrl[url]?.current;
      const loadingRequestId = listsState.byUrl[url]?.loadingRequestId;

      if (current) {
        const upgradeType = getVersionUpgrade(current.version, tokenList.version);
        if (upgradeType === VersionUpgrade.NONE) return;
        if (loadingRequestId === null || loadingRequestId === requestId) {
          const newListState = {
            ...listsState,
            byUrl: {
              ...listsState.byUrl,
              [url]: {
                ...listsState.byUrl[url],
                loadingRequestId: null,
                error: null,
                current: current,
                pendingUpdate: tokenList,
              },
            },
          };
          setListsState(newListState);
        }
      } else {
        const newListState = {
          ...listsState,
          byUrl: {
            ...listsState.byUrl,
            [url]: {
              ...listsState.byUrl[url],
              loadingRequestId: null,
              error: null,
              current: tokenList,
              pendingUpdate: null,
            },
          },
        };
        setListsState(newListState);
      }
    },
    [setListsState, listsState],
  );

  const rejectedFetchTokenList = useCallback(
    ({ url, requestId, errorMessage }: { url: string; errorMessage: string; requestId: string }) => {
      if (listsState.byUrl[url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return;
      }

      setListsState({
        ...listsState,
        byUrl: {
          ...listsState.byUrl,
          [url]: {
            ...listsState.byUrl[url],
            loadingRequestId: null,
            error: errorMessage,
            current: null,
            pendingUpdate: null,
          },
        },
      });
    },
    [setListsState, listsState],
  );

  const selectList = useCallback(
    ({ url, shouldSelect }: { url: string; shouldSelect: boolean }) => {
      const existingSelectedListUrl = ([] as string[]).concat(listsState.selectedListUrl || []);
      if (shouldSelect) {
        // if user want to select the list, then just push it into selected array
        existingSelectedListUrl.push(url);
        setListsState((prevState) => ({ ...prevState, selectedListUrl: existingSelectedListUrl }));
      } else {
        const index = existingSelectedListUrl.indexOf(url);

        if (index !== -1) {
          if (existingSelectedListUrl?.length === 1) {
            // if user want to deselect the list and if there is only one item in the list
            setListsState((prevState) => ({ ...prevState, selectedListUrl: DEFAULT_TOKEN_LISTS_SELECTED }));
          } else {
            existingSelectedListUrl.splice(index, 1);
            setListsState((prevState) => ({ ...prevState, selectedListUrl: existingSelectedListUrl }));
          }
        }
      }

      // automatically adds list
      if (!listsState.byUrl[url]) {
        setListsState((prevState) => ({
          ...prevState,
          byUrl: {
            ...prevState.byUrl,
            [url]: NEW_LIST_STATE,
          },
        }));
      }
    },
    [setListsState, listsState],
  );

  //not used
  const addList = useCallback(
    ({ url }: { url: string }) => {
      setListsState((state) => {
        if (!state.byUrl[url]) {
          const newByUrl = { ...state.byUrl, [url]: NEW_LIST_STATE };
          return { ...state, byUrl: newByUrl };
        }
        return state;
      });
    },
    [setListsState],
  );

  const removeList = useCallback(
    (url: string) => {
      const newState = { ...listsState };

      if (newState.byUrl[url]) {
        delete newState.byUrl[url];
      }

      const existingList = ([] as string[]).concat(newState.selectedListUrl || []);
      const index = existingList.indexOf(url);

      if (index !== -1) {
        if (existingList?.length === 1) {
          // if user want to remove the list and if there is only one item in the selected list
          newState.selectedListUrl = DEFAULT_TOKEN_LISTS_SELECTED;
        } else {
          existingList.splice(index, 1);
          newState.selectedListUrl = existingList;
        }
      }
      setListsState(newState);
    },
    [setListsState, listsState],
  );

  const acceptListUpdate = useCallback(
    (url: string) => {
      const newState = { ...listsState };

      if (!newState.byUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update');
      }

      newState.byUrl[url] = {
        ...newState.byUrl[url],
        pendingUpdate: null,
        current: newState.byUrl[url].pendingUpdate,
      };
      setListsState(newState);
    },
    [setListsState, listsState],
  );

  // not used
  const updateVersion = useCallback(() => {
    setListsState((prevListsState) => {
      const state = { ...prevListsState };
      // state loaded from localStorage, but new lists have never been initialized
      if (!state.lastInitializedDefaultListOfLists) {
        state.byUrl = initialState.byUrl;
        state.selectedListUrl = DEFAULT_TOKEN_LISTS_SELECTED;
      } else if (state.lastInitializedDefaultListOfLists) {
        const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce<Set<string>>(
          (s, l) => s.add(l),
          new Set(),
        );
        const newListOfListsSet = DEFAULT_TOKEN_LISTS.reduce<Set<string>>((s, l) => s.add(l), new Set());

        // Detected addition of default token lists
        DEFAULT_TOKEN_LISTS.forEach((listUrl) => {
          if (!lastInitializedSet.has(listUrl)) {
            state.byUrl[listUrl] = NEW_LIST_STATE;
            if (DEFAULT_TOKEN_LISTS_SELECTED.includes(listUrl)) {
              if (!state.selectedListUrl || !state.selectedListUrl.includes(listUrl)) {
                state.selectedListUrl = (state.selectedListUrl || []).concat([listUrl]);
              }
            }
          }
        });

        // Detected removal of default token lists
        state.lastInitializedDefaultListOfLists.forEach((listUrl) => {
          if (!newListOfListsSet.has(listUrl)) {
            delete state.byUrl[listUrl];
            if (!!state.selectedListUrl && state.selectedListUrl.includes(listUrl)) {
              state.selectedListUrl = state.selectedListUrl.filter((url) => url !== listUrl);
              if (state.selectedListUrl.length === 0) {
                state.selectedListUrl = DEFAULT_TOKEN_LISTS_SELECTED;
              }
            }
          }
        });
      }

      state.lastInitializedDefaultListOfLists = DEFAULT_TOKEN_LISTS;

      if (!state.selectedListUrl) {
        state.selectedListUrl = DEFAULT_TOKEN_LISTS_SELECTED;
        DEFAULT_TOKEN_LISTS.forEach((listUrl) => {
          if (!state.byUrl[listUrl]) {
            state.byUrl[listUrl] = NEW_LIST_STATE;
          }
        });
      }

      return state;
    });
  }, [setListsState]);

  return {
    listsState,
    pendingFetchTokenList,
    fulfilledFetchTokenList,
    rejectedFetchTokenList,
    selectList,
    addList,
    removeList,
    acceptListUpdate,
    updateVersion,
  };
};
