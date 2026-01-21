/**
 * Express App Setup
 */

import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { DEFAULTS } from '../config/defaults.js';
import { PROJECT_ROOT } from '../config/index.js';
import { createAuthMiddleware, createNgrokMiddleware } from '../middleware/index.js';
import { registerRoutes } from '../routes/index.js';

/**
 * Create and configure Express app
 * @param {Object} options - App options
 * @param {Object} options.cdpManager - CDP manager instance
 * @param {string} options.password - App password
 * @param {boolean} options.hasSSL - Whether SSL is enabled
 * @returns {Object} Express app
 */
export function createExpressApp(options = {}) {
    const { cdpManager, password = DEFAULTS.DEFAULT_PASSWORD, hasSSL = false } = options;

    const app = express();

    // Core middleware
    app.use(compression());
    app.use(express.json());
    app.use(cookieParser(DEFAULTS.COOKIE_SECRET));

    // Ngrok bypass middleware
    app.use(createNgrokMiddleware());

    // Auth middleware
    app.use(createAuthMiddleware({ password }));

    // Static files
    app.use(express.static(join(PROJECT_ROOT, 'public')));

    // Register all routes
    registerRoutes(app, { cdpManager, password, hasSSL });

    return app;
}
