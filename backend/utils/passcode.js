/**
 * Passcode utilities for Luma-CLI
 */

/**
 * Generate a random 6-digit passcode
 * @returns {string} - 6-digit passcode
 */
export function generatePasscode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a random alphanumeric string
 * @param {number} length - Length of the string
 * @returns {string}
 */
export function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
