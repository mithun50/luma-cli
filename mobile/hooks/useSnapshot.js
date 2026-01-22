// Snapshot Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { api, websocket } from '../services';
import { config } from '../constants/config';
import { wrapError, AppError } from '../utils';

export function useSnapshot(isConnected) {
  const [snapshot, setSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch snapshot
  const fetchSnapshot = useCallback(async () => {
    if (!isConnected) return;

    try {
      const data = await api.getSnapshot();
      setSnapshot(data);
      setError(null);
    } catch (err) {
      // Ignore "No snapshot available yet" as it's expected
      if (err.message !== 'No snapshot available yet') {
        const appError = err instanceof AppError ? err : wrapError(err);
        console.error('Snapshot fetch error:', appError.originalError || appError);
        setError(appError);
      }
    }
  }, [isConnected]);

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      setIsLoading(true);
      fetchSnapshot().finally(() => setIsLoading(false));
    }
  }, [isConnected, fetchSnapshot]);

  // Handle WebSocket updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchSnapshot();
    };

    websocket.on('snapshot_update', handleUpdate);

    return () => {
      websocket.off('snapshot_update', handleUpdate);
    };
  }, [fetchSnapshot]);

  // Fallback polling
  useEffect(() => {
    if (isConnected) {
      pollingRef.current = setInterval(fetchSnapshot, config.pollInterval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isConnected, fetchSnapshot]);

  // Manual refresh / retry
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchSnapshot();
    setIsLoading(false);
  }, [fetchSnapshot]);

  // Retry is same as refresh
  const retry = refresh;

  // Can retry if there's an error and the error is retryable
  const canRetry = error?.retryable ?? true;

  return {
    snapshot,
    isLoading,
    error,
    refresh,
    retry,
    canRetry,
    clearError,
  };
}

export default useSnapshot;
