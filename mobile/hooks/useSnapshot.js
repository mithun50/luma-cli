// Snapshot Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { api, websocket } from '../services';
import { config } from '../constants/config';

export function useSnapshot(isConnected) {
  const [snapshot, setSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  // Fetch snapshot
  const fetchSnapshot = useCallback(async () => {
    if (!isConnected) return;

    try {
      const data = await api.getSnapshot();
      setSnapshot(data);
      setError(null);
    } catch (err) {
      if (err.message !== 'No snapshot available yet') {
        setError(err.message);
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

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchSnapshot();
    setIsLoading(false);
  }, [fetchSnapshot]);

  return {
    snapshot,
    isLoading,
    error,
    refresh,
  };
}

export default useSnapshot;
