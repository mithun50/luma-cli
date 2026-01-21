/**
 * Authentication Routes
 */

import { Router } from 'express';
import { getAuthToken } from '../middleware/auth.js';
import { DEFAULTS } from '../config/defaults.js';

/**
 * Create auth router
 * @param {Object} options - Router options
 * @param {string} options.password - App password
 * @returns {Router} Express router
 */
export function createAuthRouter(options = {}) {
    const router = Router();
    const { password = DEFAULTS.DEFAULT_PASSWORD } = options;
    const authToken = getAuthToken(password);

    // Login endpoint
    router.post('/login', (req, res) => {
        const { password: inputPassword } = req.body;
        if (inputPassword === password) {
            res.cookie(DEFAULTS.AUTH_COOKIE_NAME, authToken, {
                httpOnly: true,
                signed: true,
                maxAge: DEFAULTS.COOKIE_MAX_AGE
            });
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
        }
    });

    // Logout endpoint
    router.post('/logout', (req, res) => {
        res.clearCookie(DEFAULTS.AUTH_COOKIE_NAME);
        res.json({ success: true });
    });

    return router;
}
