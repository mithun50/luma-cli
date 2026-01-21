/**
 * Default configuration values for Luma-CLI
 */

export const DEFAULTS = {
    // Server
    PORT: 3000,
    HOST: '0.0.0.0',

    // CDP Discovery
    CDP_PORTS: [9000, 9001, 9002, 9003],
    CDP_CALL_TIMEOUT: 30000, // 30 seconds

    // Polling
    POLL_INTERVAL: 1000, // 1 second
    RECONNECT_INTERVAL: 2000, // 2 seconds for CDP reconnection

    // Authentication
    DEFAULT_PASSWORD: 'antigravity',
    AUTH_COOKIE_NAME: 'ag_auth_token',
    COOKIE_SECRET: 'antigravity_secret_key_1337',
    COOKIE_MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days

    // SSL
    CERTS_DIR: 'certs',
    KEY_FILE: 'server.key',
    CERT_FILE: 'server.cert',
};

export const KNOWN_MODELS = ['Gemini', 'Claude', 'GPT'];
export const KNOWN_MODES = ['Fast', 'Planning'];
