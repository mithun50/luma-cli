/**
 * CDP Connection - WebSocket connection and message handling
 */

import WebSocket from 'ws';
import { DEFAULTS } from '../config/defaults.js';

/**
 * Connect to CDP WebSocket endpoint
 * @param {string} url - WebSocket debugger URL
 * @returns {Promise<{ws: WebSocket, call: Function, contexts: Array}>} CDP connection object
 */
export async function connectCDP(url) {
    const ws = new WebSocket(url);

    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
    });

    let idCounter = 1;
    const pendingCalls = new Map();
    const contexts = [];
    const CDP_CALL_TIMEOUT = DEFAULTS.CDP_CALL_TIMEOUT;

    // Single centralized message handler (fixes MaxListenersExceeded warning)
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);

            // Handle CDP method responses
            if (data.id !== undefined && pendingCalls.has(data.id)) {
                const { resolve, reject, timeoutId } = pendingCalls.get(data.id);
                clearTimeout(timeoutId);
                pendingCalls.delete(data.id);

                if (data.error) reject(data.error);
                else resolve(data.result);
            }

            // Handle execution context events
            if (data.method === 'Runtime.executionContextCreated') {
                contexts.push(data.params.context);
            } else if (data.method === 'Runtime.executionContextDestroyed') {
                const id = data.params.executionContextId;
                const idx = contexts.findIndex(c => c.id === id);
                if (idx !== -1) contexts.splice(idx, 1);
            } else if (data.method === 'Runtime.executionContextsCleared') {
                contexts.length = 0;
            }
        } catch (e) {
            // Ignore parse errors
        }
    });

    /**
     * Call a CDP method
     * @param {string} method - CDP method name
     * @param {Object} params - Method parameters
     * @returns {Promise<any>} Method result
     */
    const call = (method, params = {}) => new Promise((resolve, reject) => {
        const id = idCounter++;

        // Setup timeout to prevent memory leaks from never-resolved calls
        const timeoutId = setTimeout(() => {
            if (pendingCalls.has(id)) {
                pendingCalls.delete(id);
                reject(new Error(`CDP call ${method} timed out after ${CDP_CALL_TIMEOUT}ms`));
            }
        }, CDP_CALL_TIMEOUT);

        pendingCalls.set(id, { resolve, reject, timeoutId });
        ws.send(JSON.stringify({ id, method, params }));
    });

    // Enable runtime and wait for contexts
    await call('Runtime.enable', {});
    await new Promise(r => setTimeout(r, 1000));

    return { ws, call, contexts };
}

/**
 * Check if CDP connection is alive
 * @param {Object} cdp - CDP connection object
 * @returns {boolean}
 */
export function isCDPConnected(cdp) {
    return cdp?.ws?.readyState === WebSocket.OPEN;
}

/**
 * Close CDP connection
 * @param {Object} cdp - CDP connection object
 */
export function closeCDP(cdp) {
    if (cdp?.ws) {
        cdp.ws.close();
    }
}
