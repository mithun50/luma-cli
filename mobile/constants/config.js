// Luma Mobile Configuration
export const config = {
  // Default server URL (can be overridden)
  defaultServerUrl: 'http://192.168.1.100:3000',

  // API endpoints
  endpoints: {
    health: '/health',
    snapshot: '/snapshot',
    send: '/send',
    stop: '/stop',
    setMode: '/set-mode',
    setModel: '/set-model',
    appState: '/app-state',
    workspace: '/workspace',
    workspaceRecent: '/workspace/recent',
    workspaceOpen: '/workspace/open',
    workspaceOpenDialog: '/workspace/open-dialog',
    remoteClick: '/remote-click',
    remoteScroll: '/remote-scroll',
  },

  // Polling intervals (ms)
  pollInterval: 1000,
  healthCheckInterval: 5000,

  // WebSocket reconnect settings
  wsReconnectDelay: 1000,
  wsMaxReconnectDelay: 30000,
  wsMaxRetries: 10,

  // API request settings
  requestTimeout: 0,            // No timeout (0 = disabled)
  maxRetries: 5,                // 5 retry attempts
  retryBaseDelay: 1000,         // 1 second base delay
  retryMaxDelay: 30000,         // Max 30 seconds between retries
  retryableStatuses: [408, 429, 500, 502, 503, 504],

  // Available modes
  modes: ['Fast', 'Planning'],

  // Known models
  models: ['Gemini 2.0 Flash', 'Claude 3.5 Sonnet', 'GPT-4o'],

  // Storage keys
  storageKeys: {
    serverUrl: 'luma_server_url',
    preferences: 'luma_preferences',
  },
};

export default config;
