// Luma WebSocket Service - Robust Connection Handler
import { AppState } from 'react-native';
import { config } from '../constants/config';
import { calculateBackoffDelay, AppError, ErrorCategory } from '../utils';

// Connection states
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
};

// Connection quality levels
export const ConnectionQuality = {
  EXCELLENT: 'excellent',  // < 100ms latency
  GOOD: 'good',            // < 300ms latency
  FAIR: 'fair',            // < 500ms latency
  POOR: 'poor',            // > 500ms latency
  UNKNOWN: 'unknown',
};

class LumaWebSocket {
  constructor() {
    this.ws = null;
    this.baseUrl = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.connectionTimeout = null;

    // Heartbeat
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.lastPingTime = null;
    this.latency = null;

    // Connection state
    this.state = ConnectionState.DISCONNECTED;
    this.quality = ConnectionQuality.UNKNOWN;
    this.lastConnectedTime = null;
    this.totalReconnects = 0;

    // App state listener for background/foreground
    this.appStateSubscription = null;
    this.wasConnectedBeforeBackground = false;

    this._setupAppStateListener();
  }

  _setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        if (this.wasConnectedBeforeBackground && this.state !== ConnectionState.CONNECTED) {
          console.log('[WebSocket] App resumed, reconnecting...');
          this.forceReconnect();
        }
      } else if (nextAppState === 'background') {
        // App going to background
        this.wasConnectedBeforeBackground = this.state === ConnectionState.CONNECTED;
      }
    });
  }

  setBaseUrl(url) {
    // Convert http(s) to ws(s)
    this.baseUrl = url.replace(/^http/, 'ws');
  }

  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    if (oldState !== newState) {
      this.emit('state_change', { oldState, newState });
    }
  }

  _setQuality(latencyMs) {
    this.latency = latencyMs;
    let newQuality;

    if (latencyMs < 100) {
      newQuality = ConnectionQuality.EXCELLENT;
    } else if (latencyMs < 300) {
      newQuality = ConnectionQuality.GOOD;
    } else if (latencyMs < 500) {
      newQuality = ConnectionQuality.FAIR;
    } else {
      newQuality = ConnectionQuality.POOR;
    }

    if (this.quality !== newQuality) {
      this.quality = newQuality;
      this.emit('quality_change', { quality: newQuality, latency: latencyMs });
    }
  }

  connect() {
    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED) {
      return;
    }

    if (!this.baseUrl) {
      console.error('[WebSocket] No base URL configured');
      this._setState(ConnectionState.FAILED);
      this.emit('error', new AppError(ErrorCategory.WEBSOCKET, new Error('No base URL configured')));
      return;
    }

    this._clearAllTimers();
    this._setState(ConnectionState.CONNECTING);

    try {
      this.ws = new WebSocket(this.baseUrl);

      // Connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.state === ConnectionState.CONNECTING) {
          console.log('[WebSocket] Connection timeout');
          this.ws?.close();
          this._handleConnectionFailure(new Error('Connection timeout'));
        }
      }, config.wsConnectionTimeout);

      this.ws.onopen = () => {
        this._clearTimer('connectionTimeout');
        console.log('[WebSocket] Connected');

        this._setState(ConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
        this.lastConnectedTime = Date.now();

        this._startHeartbeat();
        this.emit('connected', { reconnected: this.totalReconnects > 0 });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle pong response
          if (data.type === 'pong') {
            this._handlePong(data);
            return;
          }

          this.emit('message', data);

          // Emit specific event types
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (e) {
          console.error('[WebSocket] Message parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error.message || 'Unknown error');
        this.emit('error', new AppError(ErrorCategory.WEBSOCKET, error));
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);

        this._stopHeartbeat();
        this._clearTimer('connectionTimeout');

        const wasConnected = this.state === ConnectionState.CONNECTED;
        this._setState(ConnectionState.DISCONNECTED);

        this.emit('disconnected', {
          code: event.code,
          reason: event.reason,
          wasConnected,
        });

        // Auto-reconnect if we were connected
        if (wasConnected || this.state === ConnectionState.RECONNECTING) {
          this._attemptReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this._handleConnectionFailure(error);
    }
  }

  _handleConnectionFailure(error) {
    this._clearAllTimers();
    this._setState(ConnectionState.DISCONNECTED);
    this.emit('error', new AppError(ErrorCategory.WEBSOCKET, error));
    this._attemptReconnect();
  }

  _attemptReconnect() {
    if (this.reconnectAttempts >= config.wsMaxRetries) {
      console.log('[WebSocket] Max reconnect attempts reached');
      this._setState(ConnectionState.FAILED);
      this.emit('max_retries', {
        attempts: this.reconnectAttempts,
        error: new AppError(
          ErrorCategory.WEBSOCKET,
          new Error('Max reconnect attempts reached'),
          'Unable to reconnect. Please check your connection.'
        ),
      });
      return;
    }

    this.reconnectAttempts++;
    this.totalReconnects++;
    this._setState(ConnectionState.RECONNECTING);

    // Calculate delay with exponential backoff + jitter
    const baseDelay = calculateBackoffDelay(
      this.reconnectAttempts - 1,
      config.wsReconnectDelay,
      config.wsMaxReconnectDelay
    );
    // Add jitter (±20%)
    const jitter = baseDelay * (0.8 + Math.random() * 0.4);
    const delay = Math.round(jitter);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${config.wsMaxRetries})...`);

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: config.wsMaxRetries,
      delay,
      nextAttemptIn: delay,
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  _startHeartbeat() {
    this._stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      this._sendPing();
    }, config.wsHeartbeatInterval);

    // Send initial ping
    setTimeout(() => this._sendPing(), 1000);
  }

  _stopHeartbeat() {
    this._clearTimer('heartbeatInterval');
    this._clearTimer('heartbeatTimeout');
    this.latency = null;
    this.quality = ConnectionQuality.UNKNOWN;
  }

  _sendPing() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.lastPingTime = Date.now();

      try {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: this.lastPingTime }));
      } catch (e) {
        console.error('[WebSocket] Ping send error:', e);
      }

      // Set timeout for pong response
      this._clearTimer('heartbeatTimeout');
      this.heartbeatTimeout = setTimeout(() => {
        console.log('[WebSocket] Heartbeat timeout - connection may be stale');
        this.emit('heartbeat_timeout');
        // Force reconnect on heartbeat timeout
        this.forceReconnect();
      }, config.wsHeartbeatTimeout);
    }
  }

  _handlePong(data) {
    this._clearTimer('heartbeatTimeout');

    if (this.lastPingTime) {
      const latency = Date.now() - this.lastPingTime;
      this._setQuality(latency);
    }
  }

  _clearTimer(timerName) {
    if (this[timerName]) {
      if (timerName.includes('Interval')) {
        clearInterval(this[timerName]);
      } else {
        clearTimeout(this[timerName]);
      }
      this[timerName] = null;
    }
  }

  _clearAllTimers() {
    this._clearTimer('reconnectTimeout');
    this._clearTimer('connectionTimeout');
    this._clearTimer('heartbeatInterval');
    this._clearTimer('heartbeatTimeout');
  }

  disconnect() {
    this._clearAllTimers();
    this.reconnectAttempts = 0;
    this._setState(ConnectionState.DISCONNECTED);

    if (this.ws) {
      this.ws.onclose = null; // Prevent auto-reconnect
      this.ws.close();
      this.ws = null;
    }
  }

  // Reset reconnect attempts (useful when manually retrying)
  resetReconnect() {
    this.reconnectAttempts = 0;
    this._clearTimer('reconnectTimeout');
  }

  // Force reconnect (resets attempts and tries immediately)
  forceReconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 100);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('[WebSocket] Send error:', e);
        return false;
      }
    }
    return false;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`[WebSocket] Event handler error (${event}):`, e);
        }
      });
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getState() {
    return this.state;
  }

  getQuality() {
    return this.quality;
  }

  getLatency() {
    return this.latency;
  }

  getConnectionInfo() {
    return {
      state: this.state,
      quality: this.quality,
      latency: this.latency,
      reconnectAttempts: this.reconnectAttempts,
      maxAttempts: config.wsMaxRetries,
      totalReconnects: this.totalReconnects,
      lastConnectedTime: this.lastConnectedTime,
      isReconnecting: this.state === ConnectionState.RECONNECTING,
    };
  }

  // Cleanup when app is unmounting
  destroy() {
    this.disconnect();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const websocket = new LumaWebSocket();
export default websocket;
