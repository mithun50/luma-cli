// Connection Hook
import { useState, useEffect, useCallback } from 'react';
import { api, websocket, storage } from '../services';

export function useConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [serverUrl, setServerUrlState] = useState(null);
  const [error, setError] = useState(null);

  // Load saved server URL on mount
  useEffect(() => {
    loadSavedUrl();
  }, []);

  const loadSavedUrl = async () => {
    const savedUrl = await storage.getServerUrl();
    if (savedUrl) {
      setServerUrlState(savedUrl);
    }
  };

  const connect = useCallback(async (url) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Set URL in services
      api.setBaseUrl(url);
      websocket.setBaseUrl(url);

      // Test connection with health check
      const health = await api.getHealth();

      if (health.status === 'ok') {
        // Save URL and connect WebSocket
        await storage.setServerUrl(url);
        setServerUrlState(url);
        websocket.connect();
        setIsConnected(true);
        setIsConnecting(false);
        return true;
      }
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }

    setIsConnecting(false);
    return false;
  }, []);

  const disconnect = useCallback(() => {
    websocket.disconnect();
    setIsConnected(false);
  }, []);

  // Handle WebSocket events
  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    const handleError = (err) => setError(err.message || 'Connection error');

    websocket.on('connected', handleConnected);
    websocket.on('disconnected', handleDisconnected);
    websocket.on('error', handleError);

    return () => {
      websocket.off('connected', handleConnected);
      websocket.off('disconnected', handleDisconnected);
      websocket.off('error', handleError);
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    serverUrl,
    error,
    connect,
    disconnect,
    setServerUrl: setServerUrlState,
  };
}

export default useConnection;
