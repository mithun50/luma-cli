// Luma API Service
import { config } from '../constants/config';
import {
  AppError,
  categorizeError,
  calculateBackoffDelay,
  sleep,
  isRetryableStatus,
} from '../utils';

class LumaAPI {
  constructor() {
    this.baseUrl = null;
  }

  setBaseUrl(url) {
    // Remove trailing slash
    this.baseUrl = url.replace(/\/$/, '');
  }

  // Check if API is configured
  isConfigured() {
    return !!this.baseUrl;
  }

  async request(endpoint, options = {}) {
    if (!this.baseUrl) {
      // Don't retry - this is a client configuration issue
      const error = new AppError('client', new Error('Server URL not configured'));
      error.retryable = false;
      throw error;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let lastError;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      // Create abort controller for timeout
      const controller = new AbortController();
      let timeoutId = null;

      if (config.requestTimeout > 0) {
        timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
      }

      try {
        const fetchOptions = {
          ...options,
          headers,
          signal: controller.signal,
        };

        const response = await fetch(url, fetchOptions);

        // Clear timeout on success
        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          const category = categorizeError(null, status);

          // Check if we should retry
          if (isRetryableStatus(status) && attempt < config.maxRetries) {
            const delay = calculateBackoffDelay(
              attempt,
              config.retryBaseDelay,
              config.retryMaxDelay
            );
            console.log(`[API] ${endpoint} failed (HTTP ${status}), retrying in ${Math.round(delay/1000)}s (${attempt + 1}/${config.maxRetries})`);
            await sleep(delay);
            continue;
          }

          // Final failure - log as warning (not error to avoid red box)
          console.warn(`[API] ${endpoint} failed: HTTP ${status}`);
          throw new AppError(category, new Error(`HTTP ${status}`));
        }

        return await response.json();
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) clearTimeout(timeoutId);

        // If it's already an AppError, preserve it
        if (error instanceof AppError) {
          lastError = error;
        } else {
          // Check if it's a timeout (abort) error
          const isTimeout = error.name === 'AbortError';
          const category = isTimeout ? 'timeout' : categorizeError(error);
          const message = isTimeout ? 'Request timed out' : error.message;
          lastError = new AppError(category, error, isTimeout ? message : null);
        }

        // Check if we should retry
        if (lastError.retryable && attempt < config.maxRetries) {
          const delay = calculateBackoffDelay(
            attempt,
            config.retryBaseDelay,
            config.retryMaxDelay
          );
          console.log(`[API] ${endpoint} failed (${lastError.message}), retrying in ${Math.round(delay/1000)}s (${attempt + 1}/${config.maxRetries})`);
          await sleep(delay);
          continue;
        }

        // Final failure
        console.warn(`[API] ${endpoint} failed:`, lastError.message);
      }
    }

    throw lastError;
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

  // Close current workspace
  async closeWorkspace() {
    return this.request(config.endpoints.workspaceClose, {
      method: 'POST',
    });
  }

  // Get all chats
  async getChats() {
    return this.request(config.endpoints.chats);
  }

  // Create new chat
  async createChat(name = '') {
    return this.request(config.endpoints.chatCreate, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Switch to a chat
  async switchChat(chatId) {
    return this.request(config.endpoints.chatSwitch, {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }

  // Delete a chat
  async deleteChat(chatId) {
    return this.request(config.endpoints.chatDelete, {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }

  // Rename a chat
  async renameChat(chatId, name) {
    return this.request(config.endpoints.chatRename, {
      method: 'POST',
      body: JSON.stringify({ chatId, name }),
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
