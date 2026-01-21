/**
 * Routes Module - Route aggregator
 */

import { createAuthRouter } from './auth.js';
import { createChatRouter } from './chat.js';
import { createSettingsRouter } from './settings.js';
import { createInteractionsRouter } from './interactions.js';
import { createSystemRouter } from './system.js';

/**
 * Register all routes on an Express app
 * @param {Object} app - Express app
 * @param {Object} options - Route options
 * @param {Object} options.cdpManager - CDP manager instance
 * @param {string} options.password - App password
 * @param {boolean} options.hasSSL - Whether SSL is enabled
 */
export function registerRoutes(app, options = {}) {
    const { cdpManager, password, hasSSL } = options;

    // Auth routes
    app.use(createAuthRouter({ password }));

    // Chat routes
    app.use(createChatRouter({ cdpManager }));

    // Settings routes
    app.use(createSettingsRouter({ cdpManager }));

    // Interactions routes
    app.use(createInteractionsRouter({ cdpManager }));

    // System routes
    app.use(createSystemRouter({ cdpManager, hasSSL }));
}

export {
    createAuthRouter,
    createChatRouter,
    createSettingsRouter,
    createInteractionsRouter,
    createSystemRouter
};
