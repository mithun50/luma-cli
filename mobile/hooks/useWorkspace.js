// Workspace Hook - Directory management with error handling
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services';
import { AppError, wrapError } from '../utils';

export function useWorkspace(isConnected) {
  const [workspace, setWorkspace] = useState(null);
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch current workspace info
  const fetchWorkspace = useCallback(async (silent = false) => {
    if (!isConnected) return;

    try {
      const info = await api.getWorkspace();
      if (info.error) {
        throw new Error(info.error);
      }
      setWorkspace(info);
      if (!silent) setError(null);
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to fetch workspace:', appError.message);
      if (!silent) {
        setError({
          message: appError.message || 'Failed to load workspace',
          title: 'Workspace Error',
          retryable: appError.retryable !== false,
        });
      }
    }
  }, [isConnected]);

  // Fetch recent workspaces
  const fetchRecentWorkspaces = useCallback(async () => {
    if (!isConnected) return;

    try {
      const result = await api.getRecentWorkspaces();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.workspaces) {
        setRecentWorkspaces(result.workspaces);
      }
    } catch (err) {
      console.warn('Failed to fetch recent workspaces:', err.message);
      // Don't set error for recent workspaces - not critical
    }
  }, [isConnected]);

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      fetchWorkspace(true);
      fetchRecentWorkspaces();
    } else {
      setWorkspace(null);
      setRecentWorkspaces([]);
      setError(null);
    }
  }, [isConnected, fetchWorkspace, fetchRecentWorkspaces]);

  // Open a specific directory with error handling
  const openDirectory = useCallback(async (directory) => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    if (!directory?.trim()) {
      return { error: 'Invalid directory path' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.openDirectory(directory);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success) {
        // Refresh workspace info after opening
        await fetchWorkspace(true);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to open directory:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to open directory',
        title: 'Open Directory Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected, fetchWorkspace]);

  // Open folder dialog on desktop with error handling
  const openFolderDialog = useCallback(async () => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.openFolderDialog();

      if (result.error) {
        throw new Error(result.error);
      }

      setIsLoading(false);

      // Refresh workspace after a short delay (user needs time to select folder)
      setTimeout(async () => {
        try {
          await fetchWorkspace(true);
        } catch (err) {
          console.warn('Failed to refresh workspace after dialog:', err.message);
        }
      }, 2000);

      return { success: true };
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to open folder dialog:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to open folder dialog',
        title: 'Open Folder Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected, fetchWorkspace]);

  // Close current workspace with error handling
  const closeWorkspace = useCallback(async () => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.closeWorkspace();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success) {
        setWorkspace(null);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to close workspace:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to close workspace',
        title: 'Close Workspace Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected]);

  // Refresh all workspace data
  const refresh = useCallback(() => {
    fetchWorkspace(false);
    fetchRecentWorkspaces();
  }, [fetchWorkspace, fetchRecentWorkspaces]);

  // Retry after error
  const retry = useCallback(() => {
    clearError();
    return refresh();
  }, [refresh, clearError]);

  return {
    workspace,
    recentWorkspaces,
    isLoading,
    error,
    openDirectory,
    openFolderDialog,
    closeWorkspace,
    refresh,
    retry,
    clearError,
  };
}

export default useWorkspace;
