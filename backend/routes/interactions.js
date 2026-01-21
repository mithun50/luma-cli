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
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await clickElement(cdpManager.cdp, { selector, index, textContent });
        res.json(result);
    });

    // Remote Scroll - sync phone scroll to desktop
    router.post('/remote-scroll', async (req, res) => {
        const { scrollTop, scrollPercent } = req.body;
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await remoteScroll(cdpManager.cdp, { scrollTop, scrollPercent });
        res.json(result);
    });

    return router;
}
