/**
 * Workspace Routes - Directory and workspace operations
 */

import { Router } from 'express';
import {
    getWorkspaceInfo,
    openFolderDialog,
    openDirectory,
    listRecentWorkspaces,
    closeWorkspace
} from '../cdp/workspace.js';

/**
 * Create workspace router
 * @param {Object} options - Router options
 * @param {Object} options.cdpManager - CDP manager instance
 * @returns {Router} Express router
 */
export function createWorkspaceRouter(options = {}) {
    const router = Router();
    const { cdpManager } = options;

    // Get current workspace info
    router.get('/workspace', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await getWorkspaceInfo(cdpManager.cdp);
        res.json(result);
    });

    // Get recent workspaces
    router.get('/workspace/recent', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await listRecentWorkspaces(cdpManager.cdp);
        res.json(result);
    });

    // Open folder dialog
    router.post('/workspace/open-dialog', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await openFolderDialog(cdpManager.cdp);
        res.json(result);
    });

    // Open specific directory
    router.post('/workspace/open', async (req, res) => {
        const { directory } = req.body;

        if (!directory) {
            return res.status(400).json({ error: 'Directory path required' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        const result = await openDirectory(cdpManager.cdp, directory);
        res.json(result);
    });

    // Close current workspace
    router.post('/workspace/close', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }
        const result = await closeWorkspace(cdpManager.cdp);
        res.json(result);
    });

    return router;
}
