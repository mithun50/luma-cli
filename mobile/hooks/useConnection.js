// Connection Hook - With Quality Tracking
import { useState, useEffect, useCallback } from 'react';
import { api, websocket, storage, ConnectionState, ConnectionQuality } from '../services';
import { AppError, wrapError } from '../utils';

export function useConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectInfo, setReconnectInfo] = useState(null);
  const [serverUrl, setServerUrlState] = useState(null);
  const [error, setError] = useState(null);

  // Connection quality tracking
  const [connectionQuality, setConnectionQuality] = useState(ConnectionQuality.UNKNOWN);
  const [latency, setLatency] = useState(null);

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

        // Connect WebSocket - don't set isConnected here
        // Let the WebSocket 'connected' event handler set it
        // This prevents race condition where UI shows connected before WS is ready
        websocket.connect();

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
    setConnectionQuality(ConnectionQuality.UNKNOWN);
    setLatency(null);
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
    const handleConnected = (data) => {
      setIsConnected(true);
      setIsReconnecting(false);
      setReconnectInfo(null);
      setError(null);
    };

    const handleDisconnected = (data) => {
      // Only set disconnected if we're not reconnecting
      if (websocket.getState() !== ConnectionState.RECONNECTING) {
        setIsConnected(false);
      }
      setConnectionQuality(ConnectionQuality.UNKNOWN);
      setLatency(null);
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
      setIsConnected(false);
      if (data?.error) {
        setError(data.error);
      }
    };

    const handleQualityChange = ({ quality, latency: lat }) => {
      setConnectionQuality(quality);
      setLatency(lat);
    };

    const handleStateChange = ({ oldState, newState }) => {
      // Update connected state based on WebSocket state
      if (newState === ConnectionState.CONNECTED) {
        setIsConnected(true);
        setIsReconnecting(false);
      } else if (newState === ConnectionState.RECONNECTING) {
        setIsReconnecting(true);
      } else if (newState === ConnectionState.FAILED) {
        setIsConnected(false);
        setIsReconnecting(false);
      }
    };

    websocket.on('connected', handleConnected);
    websocket.on('disconnected', handleDisconnected);
    websocket.on('reconnecting', handleReconnecting);
    websocket.on('error', handleError);
    websocket.on('max_retries', handleMaxRetries);
    websocket.on('quality_change', handleQualityChange);
    websocket.on('state_change', handleStateChange);

    return () => {
      websocket.off('connected', handleConnected);
      websocket.off('disconnected', handleDisconnected);
      websocket.off('reconnecting', handleReconnecting);
      websocket.off('error', handleError);
      websocket.off('max_retries', handleMaxRetries);
      websocket.off('quality_change', handleQualityChange);
      websocket.off('state_change', handleStateChange);
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectInfo,
    serverUrl,
    error,
    connectionQuality,
    latency,
    connect,
    disconnect,
    retry,
    forceReconnectWs,
    clearError,
    setServerUrl: setServerUrlState,
  };
}

export default useConnection;
