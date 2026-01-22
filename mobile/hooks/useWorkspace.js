// Workspace Hook - Directory management
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services';

export function useWorkspace(isConnected) {
  const [workspace, setWorkspace] = useState(null);
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current workspace info
  const fetchWorkspace = useCallback(async () => {
    if (!isConnected) return;

    try {
      const info = await api.getWorkspace();
      if (!info.error) {
        setWorkspace(info);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
      setError(err.message);
    }
  }, [isConnected]);

  // Fetch recent workspaces
  const fetchRecentWorkspaces = useCallback(async () => {
    if (!isConnected) return;

    try {
      const result = await api.getRecentWorkspaces();
      if (result.workspaces) {
        setRecentWorkspaces(result.workspaces);
      }
    } catch (err) {
      console.error('Failed to fetch recent workspaces:', err);
    }
  }, [isConnected]);

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      fetchWorkspace();
      fetchRecentWorkspaces();
    }
  }, [isConnected, fetchWorkspace, fetchRecentWorkspaces]);

  // Open a specific directory
  const openDirectory = useCallback(async (directory) => {
    if (!isConnected) return { error: 'Not connected' };

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.openDirectory(directory);
      if (result.success) {
        // Refresh workspace info after opening
        await fetchWorkspace();
      }
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('Failed to open directory:', err);
      setError(err.message);
      setIsLoading(false);
      return { error: err.message };
    }
  }, [isConnected, fetchWorkspace]);

  // Open folder dialog on desktop
  const openFolderDialog = useCallback(async () => {
    if (!isConnected) return { error: 'Not connected' };

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.openFolderDialog();
      setIsLoading(false);

      // Refresh workspace after a short delay (user needs time to select folder)
      setTimeout(() => {
        fetchWorkspace();
      }, 2000);

      return result;
    } catch (err) {
      console.error('Failed to open folder dialog:', err);
      setError(err.message);
      setIsLoading(false);
      return { error: err.message };
    }
  }, [isConnected, fetchWorkspace]);

  // Refresh all workspace data
  const refresh = useCallback(() => {
    fetchWorkspace();
    fetchRecentWorkspaces();
  }, [fetchWorkspace, fetchRecentWorkspaces]);

  return {
    workspace,
    recentWorkspaces,
    isLoading,
    error,
    openDirectory,
    openFolderDialog,
    refresh,
  };
}

export default useWorkspace;
