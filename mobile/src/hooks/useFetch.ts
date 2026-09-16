import { useCallback, useEffect, useRef, useState } from 'react';
import { STRINGS } from '@/constants/strings';

export const useFetch = <TData>(
  fetcher: (signal: AbortSignal) => Promise<TData>,
  deps: unknown[],
) => {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const hasData = useRef(false);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const run = async () => {
      if (!hasData.current) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await fetcher(controller.signal);
        if (isActive) {
          setData(result);
          hasData.current = true;
        }
      } catch (caught) {
        if (isActive && !controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : STRINGS.GENERIC_ERROR);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isActive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  return { data, error, isLoading, reload };
};
