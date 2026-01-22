// Luma API Service
import { config } from '../constants/config';

class LumaAPI {
  constructor() {
    this.baseUrl = null;
  }

  setBaseUrl(url) {
    // Remove trailing slash
    this.baseUrl = url.replace(/\/$/, '');
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
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

  // Get workspace info
  async getWorkspace() {
    return this.request(config.endpoints.workspace);
  }

  // Get recent workspaces
  async getRecentWorkspaces() {
    return this.request(config.endpoints.workspaceRecent);
  }

  // Open a specific directory
  async openDirectory(directory) {
    return this.request(config.endpoints.workspaceOpen, {
      method: 'POST',
      body: JSON.stringify({ directory }),
    });
  }

  // Trigger open folder dialog
  async openFolderDialog() {
    return this.request(config.endpoints.workspaceOpenDialog, {
      method: 'POST',
    });
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
}

// Export singleton instance
export const api = new LumaAPI();
export default api;
