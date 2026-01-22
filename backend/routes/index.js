/**
 * Routes Module - Route aggregator
 */

import { createChatRouter } from './chat.js';
import { createChatsRouter } from './chats.js';
import { createSettingsRouter } from './settings.js';
import { createInteractionsRouter } from './interactions.js';
import { createSystemRouter } from './system.js';
import { createWorkspaceRouter } from './workspace.js';

/**
 * Register all routes on an Express app
 * @param {Object} app - Express app
 * @param {Object} options - Route options
 * @param {Object} options.cdpManager - CDP manager instance
 * @param {boolean} options.hasSSL - Whether SSL is enabled
 */
export function registerRoutes(app, options = {}) {
    const { cdpManager, hasSSL } = options;

    // Chat routes (snapshot, send, stop)
    app.use(createChatRouter({ cdpManager }));

    // Chats routes (multi-chat management)
    app.use(createChatsRouter({ cdpManager }));

    // Settings routes
    app.use(createSettingsRouter({ cdpManager }));

    // Interactions routes
    app.use(createInteractionsRouter({ cdpManager }));

    // Workspace routes
    app.use(createWorkspaceRouter({ cdpManager }));

    // System routes
    app.use(createSystemRouter({ cdpManager, hasSSL }));
}

export {
    createChatRouter,
    createChatsRouter,
    createSettingsRouter,
    createInteractionsRouter,
    createSystemRouter,
    createWorkspaceRouter
};
