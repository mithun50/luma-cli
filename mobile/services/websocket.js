// Luma WebSocket Service
import { config } from '../constants/config';
import { calculateBackoffDelay, AppError, ErrorCategory } from '../utils';

class LumaWebSocket {
  constructor() {
    this.ws = null;
    this.baseUrl = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.reconnectTimeout = null;
  }

  setBaseUrl(url) {
    // Convert http(s) to ws(s)
    this.baseUrl = url.replace(/^http/, 'ws');
  }

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    if (!this.baseUrl) {
      console.error('WebSocket: No base URL configured');
      this.emit('error', new AppError(ErrorCategory.WEBSOCKET, new Error('No base URL configured')));
      return;
    }

    // Clear any pending reconnect
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.baseUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);

          // Emit specific event types
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error.message || 'Unknown error');
        this.isConnecting = false;
        this.emit('error', new AppError(ErrorCategory.WEBSOCKET, error));
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.emit('error', new AppError(ErrorCategory.WEBSOCKET, error));
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= config.wsMaxRetries) {
      console.log('WebSocket: Max reconnect attempts reached');
      this.emit('max_retries', {
        attempts: this.reconnectAttempts,
        error: new AppError(
          ErrorCategory.WEBSOCKET,
          new Error('Max reconnect attempts reached'),
          'Unable to reconnect after multiple attempts'
        ),
      });
      return;
    }

    this.reconnectAttempts++;

    // Calculate delay with exponential backoff
    const delay = calculateBackoffDelay(
      this.reconnectAttempts - 1,
      config.wsReconnectDelay,
      config.wsMaxReconnectDelay
    );

    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${config.wsMaxRetries})...`);

    // Emit reconnecting event with attempt info
    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: config.wsMaxRetries,
      delay,
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    // Clear any pending reconnect
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Reset reconnect counter
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Reset reconnect attempts (useful when manually retrying)
  resetReconnect() {
    this.reconnectAttempts = 0;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Force reconnect (resets attempts and tries immediately)
  forceReconnect() {
    this.disconnect();
    this.connect();
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`WebSocket event handler error (${event}):`, e);
        }
      });
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getReconnectInfo() {
    return {
      attempts: this.reconnectAttempts,
      maxAttempts: config.wsMaxRetries,
      isReconnecting: this.reconnectTimeout !== null,
    };
  }
}

// Export singleton instance
export const websocket = new LumaWebSocket();
export default websocket;
