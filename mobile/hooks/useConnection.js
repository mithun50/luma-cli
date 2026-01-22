// Connection Hook
import { useState, useEffect, useCallback } from 'react';
import { api, websocket, storage } from '../services';
import { AppError, wrapError } from '../utils';

export function useConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectInfo, setReconnectInfo] = useState(null);
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
      const appError = wrapError(err);
      setError(appError);
      setIsConnected(false);
    }

    setIsConnecting(false);
    return false;
  }, []);

  const disconnect = useCallback(() => {
    websocket.disconnect();
    setIsConnected(false);
    setIsReconnecting(false);
    setReconnectInfo(null);
    setError(null);
  }, []);

  // Manual retry connection
  const retry = useCallback(async () => {
    if (!serverUrl) return false;

    setError(null);
    websocket.resetReconnect();
    return connect(serverUrl);
  }, [serverUrl, connect]);

  // Force reconnect WebSocket
  const forceReconnectWs = useCallback(() => {
    if (serverUrl) {
      websocket.forceReconnect();
    }
  }, [serverUrl]);

  // Handle WebSocket events
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setReconnectInfo(null);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleReconnecting = (info) => {
      setIsReconnecting(true);
      setReconnectInfo(info);
    };

    const handleError = (err) => {
      const appError = err instanceof AppError ? err : wrapError(err);
      setError(appError);
    };

    const handleMaxRetries = (data) => {
      setIsReconnecting(false);
      setReconnectInfo(null);
      if (data?.error) {
        setError(data.error);
      }
    };

    websocket.on('connected', handleConnected);
    websocket.on('disconnected', handleDisconnected);
    websocket.on('reconnecting', handleReconnecting);
    websocket.on('error', handleError);
    websocket.on('max_retries', handleMaxRetries);

    return () => {
      websocket.off('connected', handleConnected);
      websocket.off('disconnected', handleDisconnected);
      websocket.off('reconnecting', handleReconnecting);
      websocket.off('error', handleError);
      websocket.off('max_retries', handleMaxRetries);
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectInfo,
    serverUrl,
    error,
    connect,
    disconnect,
    retry,
    forceReconnectWs,
    clearError,
    setServerUrl: setServerUrlState,
  };
}

export default useConnection;
