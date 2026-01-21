/**
 * Configuration loader for Luma-CLI
 */

import 'dotenv/config';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DEFAULTS } from './defaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (two levels up from backend/config)
export const PROJECT_ROOT = join(__dirname, '..', '..');

/**
 * Get configuration value with env override
 */
export function getConfig(key, defaultValue = null) {
    const envValue = process.env[key];
    if (envValue !== undefined) {
        return envValue;
    }
    return DEFAULTS[key] ?? defaultValue;
}

/**
 * Get server configuration
 */
export function getServerConfig() {
    return {
        port: parseInt(process.env.PORT || DEFAULTS.PORT, 10),
        host: DEFAULTS.HOST,
        password: process.env.APP_PASSWORD || DEFAULTS.DEFAULT_PASSWORD,
    };
}

/**
 * Get SSL configuration
 */
export function getSSLConfig() {
    const certsDir = join(PROJECT_ROOT, DEFAULTS.CERTS_DIR);
    const keyPath = join(certsDir, DEFAULTS.KEY_FILE);
    const certPath = join(certsDir, DEFAULTS.CERT_FILE);

    return {
        certsDir,
        keyPath,
        certPath,
        hasSSL: fs.existsSync(keyPath) && fs.existsSync(certPath),
    };
}

/**
 * Get ngrok configuration
 */
export function getNgrokConfig() {
    return {
        authToken: process.env.NGROK_AUTHTOKEN,
    };
}

/**
 * Get all configuration as object
 */
export function getAllConfig() {
    return {
        server: getServerConfig(),
        ssl: getSSLConfig(),
        ngrok: getNgrokConfig(),
        cdp: {
            ports: DEFAULTS.CDP_PORTS,
            timeout: DEFAULTS.CDP_CALL_TIMEOUT,
        },
    };
}
