// Luma WebSocket Service
import { config } from '../constants/config';

class LumaWebSocket {
  constructor() {
    this.ws = null;
    this.baseUrl = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
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
      return;
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
        console.error('WebSocket error:', error.message);
        this.isConnecting = false;
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= config.wsMaxRetries) {
      console.log('WebSocket: Max reconnect attempts reached');
      this.emit('max_retries');
      return;
    }

    this.reconnectAttempts++;
    console.log(`WebSocket: Reconnecting (attempt ${this.reconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, config.wsReconnectDelay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
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
}

// Export singleton instance
export const websocket = new LumaWebSocket();
export default websocket;
