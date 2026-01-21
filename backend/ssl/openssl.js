/**
 * OpenSSL Detection and Utilities
 */

import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Check if OpenSSL is available (including Git for Windows bundled version)
 * @returns {string|null} Path to OpenSSL or null if not found
 */
export function getOpenSSLPath() {
    // Try system PATH first
    try {
        execSync('openssl version', { stdio: 'pipe' });
        return 'openssl';
    } catch { }

    // Try Git for Windows bundled OpenSSL
    const gitOpenSSL = 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe';
    try {
        if (fs.existsSync(gitOpenSSL)) {
            execSync(`"${gitOpenSSL}" version`, { stdio: 'pipe' });
            return gitOpenSSL;
        }
    } catch { }

    // Try Git for Windows (x86)
    const gitOpenSSL32 = 'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe';
    try {
        if (fs.existsSync(gitOpenSSL32)) {
            execSync(`"${gitOpenSSL32}" version`, { stdio: 'pipe' });
            return gitOpenSSL32;
        }
    } catch { }

    return null;
}

/**
 * Check if OpenSSL is available
 * @returns {boolean}
 */
export function hasOpenSSL() {
    return getOpenSSLPath() !== null;
}
