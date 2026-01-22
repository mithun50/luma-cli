// App State Hook (Mode and Model)
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services';
import { wrapError, AppError } from '../utils';

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
    if (!isConnected) return;

    try {
      const state = await api.getAppState();
      if (state.mode) setModeState(state.mode);
      if (state.model) setModelState(state.model);
      setError(null);
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.error('Failed to fetch app state:', appError.originalError || appError);
      setError(appError);
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
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.setMode(newMode);
      if (result.success || result.alreadySet) {
        setModeState(newMode);
      }
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.error('Failed to set mode:', appError.originalError || appError);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Set model
  const setModel = useCallback(async (newModel) => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.setModel(newModel);
      if (result.success) {
        setModelState(newModel);
      }
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.error('Failed to set model:', appError.originalError || appError);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

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
