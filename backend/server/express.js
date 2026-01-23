/**
 * Express App Setup
 */

import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { DEFAULTS } from '../config/defaults.js';
import { PROJECT_ROOT } from '../config/index.js';
import { createNgrokMiddleware } from '../middleware/index.js';
import { registerRoutes } from '../routes/index.js';

/**
 * Create and configure Express app
 * @param {Object} options - App options
 * @param {Object} options.cdpManager - CDP manager instance
 * @param {boolean} options.hasSSL - Whether SSL is enabled
 * @returns {Object} Express app
 */
export function createExpressApp(options = {}) {
    const { cdpManager, hasSSL = false } = options;

    const app = express();

    // CORS middleware - allow all origins for mobile app access
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });

    // Core middleware
    app.use(compression());
    app.use(express.json());
    app.use(cookieParser(DEFAULTS.COOKIE_SECRET));

    // Ngrok bypass middleware
    app.use(createNgrokMiddleware());

    // Static files
    app.use(express.static(join(PROJECT_ROOT, 'public')));

    // Register all routes
    registerRoutes(app, { cdpManager, hasSSL });

    return app;
}
