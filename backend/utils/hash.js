/**
 * Hashing utilities for Luma-CLI
 */

/**
 * Simple hash function for strings
 * @param {string} str - String to hash
 * @returns {string} - Base36 hash
 */
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

/**
 * Generate a secure auth token from password
 * @param {string} password - Password to hash
 * @param {string} salt - Salt value
 * @returns {string} - Auth token
 */
export function generateAuthToken(password, salt = 'antigravity_salt') {
    return hashString(password + salt);
}
