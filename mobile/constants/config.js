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
    // Workspace endpoints
    workspace: '/workspace',
    workspaceRecent: '/workspace/recent',
    workspaceOpen: '/workspace/open',
    workspaceOpenDialog: '/workspace/open-dialog',
    workspaceClose: '/workspace/close',
    // Multichat endpoints
    chats: '/chats',
    chatCreate: '/chat/create',
    chatSwitch: '/chat/switch',
    chatDelete: '/chat/delete',
    chatRename: '/chat/rename',
    // Remote control
    remoteClick: '/remote-click',
    remoteScroll: '/remote-scroll',
  },

  // Polling intervals (ms)
  pollInterval: 2000,
  healthCheckInterval: 5000,

  // WebSocket settings
  wsReconnectDelay: 1000,
  wsMaxReconnectDelay: 30000,
  wsMaxRetries: 15,              // Increased retries
  wsHeartbeatInterval: 30000,    // Send ping every 30 seconds
  wsHeartbeatTimeout: 15000,     // Wait 15 seconds for pong (more lenient for slow networks)
  wsConnectionTimeout: 15000,    // 15 second connection timeout

  // API request settings
  requestTimeout: 20000,         // 20 second timeout per request
  maxRetries: 3,                 // 3 retry attempts
  retryBaseDelay: 1000,          // 1 second base delay
  retryMaxDelay: 30000,          // Max 30 seconds between retries
  retryableStatuses: [408, 429, 500, 502, 503, 504],

  // Available modes
  modes: ['Fast', 'Planning'],

  // Known models (current valid models)
  models: [
    'Gemini 3 Pro (high)',
    'Gemini 3 Pro (low)',
    'Gemini 3 Flash',
    'Claude Sonnet 4.5',
    'Claude Sonnet 4.5 (thinking)',
    'Claude Opus 4.5 (thinking)',
    'GPT-o3',
  ],

  // Storage keys
  storageKeys: {
    serverUrl: 'luma_server_url',
    preferences: 'luma_preferences',
    connectionHistory: 'luma_connection_history',
  },
};

export default config;
