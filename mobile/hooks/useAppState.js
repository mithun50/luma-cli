// App State Hook (Mode and Model)
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services';
import { wrapError, AppError } from '../utils';

// Errors to silently ignore
const IGNORED_ERRORS = [
  'Server URL not configured',
];

export function useAppState(isConnected) {
  const [mode, setModeState] = useState('Unknown');
  const [model, setModelState] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch current state
  const fetchState = useCallback(async () => {
    if (!isConnected || !api.isConfigured()) return;

    try {
      const state = await api.getAppState();
      if (state.mode) setModeState(state.mode);
      if (state.model) setModelState(state.model);
      setError(null);
    } catch (err) {
      // Check if this is an ignorable error
      const isIgnored = IGNORED_ERRORS.some(msg =>
        err.message?.includes(msg)
      );

      if (isIgnored) {
        return; // Silently ignore
      }

      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('[AppState] Fetch failed:', appError.message);
      // Don't set error for fetch failures - it's not critical
    }
  }, [isConnected]);

  // Clear state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setModeState('Unknown');
      setModelState('Unknown');
      setError(null);
    }
  }, [isConnected]);

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      fetchState();
    }
  }, [isConnected, fetchState]);

  // Set mode
  const setMode = useCallback(async (newMode) => {
    if (!isConnected || !api.isConfigured()) return;

    const previousMode = mode; // Store for rollback
    setIsLoading(true);
    setError(null);
    setModeState(newMode); // Optimistic update

    try {
      const result = await api.setMode(newMode);
      if (!result.success && !result.alreadySet) {
        // Rollback on failure
        setModeState(previousMode);
      }
    } catch (err) {
      // Rollback on error
      setModeState(previousMode);
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('[AppState] Failed to set mode:', appError.message);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, mode]);

  // Set model
  const setModel = useCallback(async (newModel) => {
    if (!isConnected || !api.isConfigured()) return;

    const previousModel = model; // Store for rollback
    setIsLoading(true);
    setError(null);
    setModelState(newModel); // Optimistic update

    try {
      const result = await api.setModel(newModel);
      if (!result.success) {
        // Rollback on failure
        setModelState(previousModel);
      }
    } catch (err) {
      // Rollback on error
      setModelState(previousModel);
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('[AppState] Failed to set model:', appError.message);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, model]);

  // Refresh state
  const refresh = useCallback(() => {
    fetchState();
  }, [fetchState]);

  return {
    mode,
    model,
    isLoading,
    error,
    setMode,
    setModel,
    refresh,
    clearError,
  };
}

export default useAppState;
