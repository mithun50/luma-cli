/**
 * Settings Routes - Mode, model, app state
 */

import { Router } from 'express';
import { setMode, setModel, getAppState } from '../cdp/index.js';

/**
 * Create settings router
 * @param {Object} options - Router options
 * @param {Object} options.cdpManager - CDP manager instance
 * @returns {Router} Express router
 */
export function createSettingsRouter(options = {}) {
    const router = Router();
    const { cdpManager } = options;

    // Set Mode
    router.post('/set-mode', async (req, res) => {
        const { mode } = req.body;
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await setMode(cdpManager.cdp, mode);
        res.json(result);
    });

    // Set Model
    router.post('/set-model', async (req, res) => {
        const { model } = req.body;
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await setModel(cdpManager.cdp, model);
        res.json(result);
    });

    // Get App State
    router.get('/app-state', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.json({ mode: 'Unknown', model: 'Unknown' });
        }
        const result = await getAppState(cdpManager.cdp);
        res.json(result);
    });

    return router;
}
