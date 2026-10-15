import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';

export interface ApiQueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** Re-runs the request with the same key. */
  reload: () => void;
  /** Replaces the cached data locally, e.g. with the response of a successful update. */
  mutate: (data: T) => void;
}

interface Settled<T> {
  requestId: string | null;
  data: T | null;
  error: string | null;
}

/**
 * Runs `fetcher` whenever `key` changes, cancelling any in-flight request.
 * Previous data is kept while a new request loads so lists don't flash empty
 * when paging or filtering. Pass `null` as the key to skip fetching.
 */
export function useApiQuery<T>(key: string | null, fetcher: (signal: AbortSignal) => Promise<T>): ApiQueryState<T> {
  const fetcherRef = useRef(fetcher);
  useLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [reloadToken, setReloadToken] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ requestId: null, data: null, error: null });

  const requestId = key === null ? null : `${key}#${reloadToken}`;

  useEffect(() => {
    if (requestId === null) return;
    const controller = new AbortController();

    fetcherRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setSettled({ requestId, data, error: null });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setSettled((previous) => ({ requestId, data: previous.data, error: getErrorMessage(error) }));
        }
      },
    );

    return () => controller.abort();
  }, [requestId]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const mutate = useCallback((data: T) => setSettled({ requestId, data, error: null }), [requestId]);

  // Loading is derived: the latest request hasn't settled yet.
  const loading = requestId !== null && settled.requestId !== requestId;

  return { data: settled.data, error: loading ? null : settled.error, loading, reload, mutate };
}
