// Luma API Service
import { config } from '../constants/config';

class LumaAPI {
  constructor() {
    this.baseUrl = null;
    this.authToken = null;
  }

  setBaseUrl(url) {
    // Remove trailing slash
    this.baseUrl = url.replace(/\/$/, '');
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async request(endpoint, options = {}) {
    if (!this.baseUrl) {
      throw new Error('Server URL not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Cookie'] = `ag_auth_token=${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Health check
  async getHealth() {
    return this.request(config.endpoints.health);
  }

  // Get chat snapshot
  async getSnapshot() {
    return this.request(config.endpoints.snapshot);
  }

  // Send message
  async sendMessage(message) {
    return this.request(config.endpoints.send, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Stop generation
  async stopGeneration() {
    return this.request(config.endpoints.stop, {
      method: 'POST',
    });
  }

  // Set mode (Fast/Planning)
  async setMode(mode) {
    return this.request(config.endpoints.setMode, {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  // Set model
  async setModel(model) {
    return this.request(config.endpoints.setModel, {
      method: 'POST',
      body: JSON.stringify({ model }),
    });
  }

  // Get app state (current mode and model)
  async getAppState() {
    return this.request(config.endpoints.appState);
  }

  // Remote click
  async remoteClick(selector, index = 0, textContent = '') {
    return this.request(config.endpoints.remoteClick, {
      method: 'POST',
      body: JSON.stringify({ selector, index, textContent }),
    });
  }

  // Remote scroll
  async remoteScroll(scrollPercent) {
    return this.request(config.endpoints.remoteScroll, {
      method: 'POST',
      body: JSON.stringify({ scrollPercent }),
    });
  }

  // Login
  async login(password) {
    return this.request(config.endpoints.login, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Logout
  async logout() {
    return this.request(config.endpoints.logout, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const api = new LumaAPI();
export default api;
