// App State Hook (Mode and Model)
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services';

export function useAppState(isConnected) {
  const [mode, setModeState] = useState('Unknown');
  const [model, setModelState] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current state
  const fetchState = useCallback(async () => {
    if (!isConnected) return;

    try {
      const state = await api.getAppState();
      if (state.mode) setModeState(state.mode);
      if (state.model) setModelState(state.model);
    } catch (err) {
      console.error('Failed to fetch app state:', err);
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
    try {
      const result = await api.setMode(newMode);
      if (result.success || result.alreadySet) {
        setModeState(newMode);
      }
    } catch (err) {
      console.error('Failed to set mode:', err);
    }
    setIsLoading(false);
  }, [isConnected]);

  // Set model
  const setModel = useCallback(async (newModel) => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const result = await api.setModel(newModel);
      if (result.success) {
        setModelState(newModel);
      }
    } catch (err) {
      console.error('Failed to set model:', err);
    }
    setIsLoading(false);
  }, [isConnected]);

  // Refresh state
  const refresh = useCallback(() => {
    fetchState();
  }, [fetchState]);

  return {
    mode,
    model,
    isLoading,
    setMode,
    setModel,
    refresh,
  };
}

export default useAppState;
