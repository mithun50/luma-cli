// Snapshot Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { api, websocket } from '../services';
import { config } from '../constants/config';
import { wrapError, AppError } from '../utils';

// Errors to silently ignore (expected during normal operation)
const IGNORED_ERRORS = [
  'No snapshot available yet',
  'Server URL not configured',
];

// Errors that indicate server is temporarily unavailable (don't spam UI)
const TRANSIENT_STATUS_CODES = [502, 503, 504];

export function useSnapshot(isConnected) {
  const [snapshot, setSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const consecutiveErrorsRef = useRef(0);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch snapshot
  const fetchSnapshot = useCallback(async () => {
    // Don't fetch if not connected or API not configured
    if (!isConnected || !api.isConfigured()) return;

    try {
      const data = await api.getSnapshot();
      setSnapshot(data);
      setError(null);
      consecutiveErrorsRef.current = 0;
    } catch (err) {
      // Check if this is an ignorable error
      const isIgnored = IGNORED_ERRORS.some(msg =>
        err.message?.includes(msg)
      );

      if (isIgnored) {
        return; // Silently ignore
      }

      // Check if this is a transient server error (503, etc.)
      const statusMatch = err.message?.match(/HTTP (\d+)/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : null;
      const isTransient = statusCode && TRANSIENT_STATUS_CODES.includes(statusCode);

      consecutiveErrorsRef.current++;

      // Only log and show error after multiple consecutive failures
      // This prevents UI spam during server startup/restart
      if (consecutiveErrorsRef.current >= 3) {
        const appError = err instanceof AppError ? err : wrapError(err);

        // Use warn instead of error to avoid red box
        if (!isTransient) {
          console.warn('[Snapshot] Fetch failed:', appError.message);
        }

        setError(appError);
      }
    }
  }, [isConnected]);

  // Clear state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setSnapshot(null);
      setError(null);
      consecutiveErrorsRef.current = 0;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
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
        pollingRef.current = null;
      }
    };
  }, [isConnected, fetchSnapshot]);

  // Manual refresh / retry
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    consecutiveErrorsRef.current = 0;
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
