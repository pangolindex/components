import { createContext, useContext } from 'react';

export const HasuraContext = createContext<string | undefined>(undefined);

export function useHasuraKey() {
  return useContext(HasuraContext);
}
