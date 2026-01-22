/**
 * Chats Routes - Multi-chat management
 */

import { Router } from 'express';
import {
    getChats,
    createChat,
    switchChat,
    deleteChat,
    renameChat
} from '../cdp/chats.js';

/**
 * Create chats router
 * @param {Object} options - Router options
 * @param {Object} options.cdpManager - CDP manager instance
 * @returns {Router} Express router
 */
export function createChatsRouter(options = {}) {
    const router = Router();
    const { cdpManager } = options;

    // Get all chats
    router.get('/chats', async (req, res) => {
        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected', chats: [] });
        }
        const result = await getChats(cdpManager.cdp);
        res.json(result);
    });

    // Create new chat
    router.post('/chat/create', async (req, res) => {
        const { name } = req.body;

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        const result = await createChat(cdpManager.cdp, name || '');
        res.json(result);
    });

    // Switch to a chat
    router.post('/chat/switch', async (req, res) => {
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ error: 'chatId required' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        const result = await switchChat(cdpManager.cdp, chatId);
        res.json(result);
    });

    // Delete a chat
    router.post('/chat/delete', async (req, res) => {
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ error: 'chatId required' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        const result = await deleteChat(cdpManager.cdp, chatId);
        res.json(result);
    });

    // Rename a chat
    router.post('/chat/rename', async (req, res) => {
        const { chatId, name } = req.body;

        if (!chatId || !name) {
            return res.status(400).json({ error: 'chatId and name required' });
        }

        if (!cdpManager.isConnected()) {
            return res.status(503).json({ error: 'CDP disconnected' });
        }

        const result = await renameChat(cdpManager.cdp, chatId, name);
        res.json(result);
    });

    return router;
}
