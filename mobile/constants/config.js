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
    remoteClick: '/remote-click',
    remoteScroll: '/remote-scroll',
    login: '/login',
    logout: '/logout',
  },

  // Polling intervals (ms)
  pollInterval: 1000,
  healthCheckInterval: 5000,

  // WebSocket reconnect settings
  wsReconnectDelay: 2000,
  wsMaxRetries: 10,

  // Available modes
  modes: ['Fast', 'Planning'],

  // Known models
  models: ['Gemini 2.0 Flash', 'Claude 3.5 Sonnet', 'GPT-4o'],

  // Storage keys
  storageKeys: {
    serverUrl: 'luma_server_url',
    authToken: 'luma_auth_token',
    preferences: 'luma_preferences',
  },
};

export default config;
