/**
 * Authentication Middleware
 */

import cookieParser from 'cookie-parser';
import { isLocalRequest } from '../utils/network.js';
import { generateAuthToken } from '../utils/hash.js';
import { DEFAULTS } from '../config/defaults.js';

const AUTH_COOKIE_NAME = DEFAULTS.AUTH_COOKIE_NAME;

/**
 * Create authentication middleware
 * @param {Object} options - Middleware options
 * @param {string} options.password - App password
 * @returns {Function} Express middleware
 */
export function createAuthMiddleware(options = {}) {
    const { password = DEFAULTS.DEFAULT_PASSWORD } = options;
    const authToken = generateAuthToken(password);

    return (req, res, next) => {
        const publicPaths = ['/', '/login', '/health', '/favicon.ico'];
        if (publicPaths.includes(req.path) || req.path.startsWith('/css/')) {
            return next();
        }

        // Exempt local Wi-Fi devices from authentication
        if (isLocalRequest(req)) {
            return next();
        }

        // Magic Link / QR Code Auto-Login
        if (req.query.key === password) {
            res.cookie(AUTH_COOKIE_NAME, authToken, {
                httpOnly: true,
                signed: true,
                maxAge: DEFAULTS.COOKIE_MAX_AGE
            });
            // Remove the key from the URL by redirecting to the base path
            return res.redirect('/');
        }

        const token = req.signedCookies[AUTH_COOKIE_NAME];
        if (token === authToken) {
            return next();
        }

        // If it's an API request, return 401, otherwise redirect to login
        if (req.xhr || req.headers.accept?.includes('json') ||
            req.path.startsWith('/snapshot') || req.path.startsWith('/send')) {
            res.status(401).json({ error: 'Unauthorized' });
        } else {
            res.redirect('/login');
        }
    };
}

/**
 * Verify WebSocket authentication
 * @param {Object} req - HTTP request
 * @param {Object} options - Auth options
 * @param {string} options.password - App password
 * @returns {boolean} Whether authenticated
 */
export function verifyWSAuth(req, options = {}) {
    const { password = DEFAULTS.DEFAULT_PASSWORD } = options;
    const authToken = generateAuthToken(password);

    // Parse cookies from headers
    const rawCookies = req.headers.cookie || '';
    const parsedCookies = {};
    rawCookies.split(';').forEach(c => {
        const [k, v] = c.trim().split('=');
        if (k && v) {
            try {
                parsedCookies[k] = decodeURIComponent(v);
            } catch (e) {
                parsedCookies[k] = v;
            }
        }
    });

    // Exempt local Wi-Fi devices from authentication
    if (isLocalRequest(req)) {
        return true;
    }

    // Verify signed cookie manually
    const signedToken = parsedCookies[AUTH_COOKIE_NAME];
    if (signedToken) {
        const token = cookieParser.signedCookie(signedToken, DEFAULTS.COOKIE_SECRET);
        if (token === authToken) {
            return true;
        }
    }

    return false;
}

/**
 * Get auth token for a password
 */
export function getAuthToken(password) {
    return generateAuthToken(password);
}
