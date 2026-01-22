/**
 * WebSocket Handler
 */

import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

/**
 * Create WebSocket server and handler
 * @param {Object} server - HTTP/HTTPS server
 * @returns {WebSocketServer} WebSocket server instance
 */
export function createWebSocketServer(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        console.log('\ud83d\udcf1 Client connected');

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
