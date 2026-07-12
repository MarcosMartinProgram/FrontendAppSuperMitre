import { useEffect } from 'react';

export const useKeyboard = (keyMap) => {
  useEffect(() => {
    const handler = (e) => {
      const action = keyMap[e.key];
      if (action) {
        e.preventDefault();
        action(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyMap]);
};
