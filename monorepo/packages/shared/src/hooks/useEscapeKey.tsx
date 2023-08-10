import { RefObject, useEffect, useRef } from 'react';

const KEY_NAME_ESC = 'Escape';
const KEY_EVENT_TYPE = 'keyup';

export function useEscapeKey<T extends HTMLElement>(node: RefObject<T | undefined>, handler: undefined | (() => void)) {
  const handlerRef = useRef<undefined | (() => void)>(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleClickOutside = (e: KeyboardEvent) => {
      if (e.key === KEY_NAME_ESC) {
        if (node.current?.contains(e.target as Node) ?? false) {
          return;
        }
        if (handlerRef.current) handlerRef.current();
      }
    };

    document.addEventListener(KEY_EVENT_TYPE, handleClickOutside);

    return () => {
      document.removeEventListener(KEY_EVENT_TYPE, handleClickOutside);
    };
  }, [node]);
}
