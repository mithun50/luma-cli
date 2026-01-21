/**
 * WebSocket Handler
 */

import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import cookieParser from 'cookie-parser';
import { isLocalRequest } from '../utils/network.js';
import { generateAuthToken } from '../utils/hash.js';
import { DEFAULTS } from '../config/defaults.js';

/**
 * Create WebSocket server and handler
 * @param {Object} server - HTTP/HTTPS server
 * @param {Object} options - WebSocket options
 * @param {string} options.password - App password
 * @returns {WebSocketServer} WebSocket server instance
 */
export function createWebSocketServer(server, options = {}) {
    const { password = DEFAULTS.DEFAULT_PASSWORD } = options;
    const wss = new WebSocketServer({ server });
    const authToken = generateAuthToken(password);

    wss.on('connection', (ws, req) => {
        // Parse cookies from headers
        const rawCookies = req.headers.cookie || '';
        const parsedCookies = {};
        rawCookies.split(';').forEach(c => {
            const [k, v] = c.trim().split('=');
            if (k && v) {
                try {
                    parsedCookies[k] = decodeURIComponent(v);
                } catch (e) {
                    parsedCookies[k] = v;
                }
            }
        });

        // Verify signed cookie manually
        const signedToken = parsedCookies[DEFAULTS.AUTH_COOKIE_NAME];
        let isAuthenticated = false;

        // Exempt local Wi-Fi devices from authentication
        if (isLocalRequest(req)) {
            isAuthenticated = true;
        } else if (signedToken) {
            const token = cookieParser.signedCookie(signedToken, DEFAULTS.COOKIE_SECRET);
            if (token === authToken) {
                isAuthenticated = true;
            }
        }

        if (!isAuthenticated) {
            console.log('\ud83d\udeab Unauthorized WebSocket connection attempt');
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
            setTimeout(() => ws.close(), 100);
            return;
        }

        console.log('\ud83d\udcf1 Client connected (Authenticated)');

        ws.on('close', () => {
            console.log('\ud83d\udcf1 Client disconnected');
        });
    });

    return wss;
}

/**
 * Broadcast message to all connected WebSocket clients
 * @param {WebSocketServer} wss - WebSocket server
 * @param {Object} message - Message to broadcast
 */
export function broadcast(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
