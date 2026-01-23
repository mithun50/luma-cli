/**
 * Interactions Routes - Remote click and scroll
 */

import { Router } from 'express';
import { clickElement, remoteScroll } from '../cdp/index.js';

/**
 * Create interactions router
 * @param {Object} options - Router options
 * @param {Object} options.cdpManager - CDP manager instance
 * @returns {Router} Express router
 */
export function createInteractionsRouter(options = {}) {
    const router = Router();
    const { cdpManager } = options;

    // Remote Click
    router.post('/remote-click', async (req, res) => {
        const { selector, index, textContent } = req.body;

        // Validate required parameters
        if (!selector) {
            return res.status(400).json({ error: 'Missing required parameter: selector' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        try {
            const result = await clickElement(cdpManager.cdp, { selector, index: index || 0, textContent: textContent || '' });
            res.json(result);
        } catch (err) {
            console.error('Remote click error:', err.message);
            res.status(500).json({ error: 'Click failed: ' + err.message });
        }
    });

    // Remote Scroll - sync phone scroll to desktop
    router.post('/remote-scroll', async (req, res) => {
        const { scrollTop, scrollPercent } = req.body;

        // Accept either scrollTop or scrollPercent
        if (scrollTop === undefined && scrollPercent === undefined) {
            return res.status(400).json({ error: 'Missing parameter: scrollTop or scrollPercent required' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        try {
            const result = await remoteScroll(cdpManager.cdp, { scrollTop, scrollPercent });
            res.json(result);
        } catch (err) {
            console.error('Remote scroll error:', err.message);
            res.status(500).json({ error: 'Scroll failed: ' + err.message });
        }
    });

    return router;
}
