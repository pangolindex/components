import { TokenList, Version } from '@pangolindex/token-lists';
import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{ url: string; tokenList: TokenList; requestId: string }>;
  rejected: ActionCreatorWithPayload<{ url: string; errorMessage: string; requestId: string }>;
}> = {
  pending: createAction('plists/fetchTokenList/pending'),
  fulfilled: createAction('plists/fetchTokenList/fulfilled'),
  rejected: createAction('plists/fetchTokenList/rejected'),
};

export const acceptListUpdate = createAction<string>('plists/acceptListUpdate');
export const addList = createAction<string>('plists/addList');
export const removeList = createAction<string>('plists/removeList');
export const selectList = createAction<{ url: string; shouldSelect: boolean }>('plists/selectList');
export const rejectVersionUpdate = createAction<Version>('plists/rejectVersionUpdate');
