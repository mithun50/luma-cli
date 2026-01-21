/**
 * Chat Routes - Snapshot, send, stop
 */

import { Router } from 'express';
import { injectMessage, stopGeneration } from '../cdp/index.js';

/**
 * Create chat router
 * @param {Object} options - Router options
 * @param {Object} options.cdpManager - CDP manager instance
 * @returns {Router} Express router
 */
export function createChatRouter(options = {}) {
    const router = Router();
    const { cdpManager } = options;

    // Get current snapshot
    router.get('/snapshot', (req, res) => {
        const snapshot = cdpManager.getSnapshot();
        if (!snapshot) {
            return res.status(503).json({ error: 'No snapshot available yet' });
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(snapshot);
    });

    // Send message
    router.post('/send', async (req, res) => {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP not connected' });
        }

        const result = await injectMessage(cdpManager.cdp, message);

        // Always return 200 - the message usually goes through even if CDP reports issues
        // The client will refresh and see if the message appeared
        res.json({
            success: result.ok !== false,
            method: result.method || 'attempted',
            details: result
        });
    });

    // Stop generation
    router.post('/stop', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await stopGeneration(cdpManager.cdp);
        res.json(result);
    });

    return router;
}
