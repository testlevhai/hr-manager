import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

export const useRefreshOnFocus = (refresh: () => void) => {
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }

      refresh();
    }, [refresh]),
  );
};
