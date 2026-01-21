/**
 * CDP Discovery - Port scanning for Antigravity IDE
 */

import http from 'http';
import { DEFAULTS } from '../config/defaults.js';

/**
 * HTTP GET JSON helper
 */
function getJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Discover Antigravity CDP endpoint
 * Scans configured ports (9000-9003) for the workbench debugger
 * @returns {Promise<{port: number, url: string}>} CDP connection info
 */
export async function discoverCDP() {
    const ports = DEFAULTS.CDP_PORTS;
    const errors = [];

    for (const port of ports) {
        try {
            const list = await getJson(`http://127.0.0.1:${port}/json/list`);
            // Look for workbench specifically (where #cascade exists, which has the chat)
            const found = list.find(t =>
                t.url?.includes('workbench.html') ||
                (t.title && t.title.includes('workbench'))
            );
            if (found && found.webSocketDebuggerUrl) {
                return { port, url: found.webSocketDebuggerUrl };
            }
        } catch (e) {
            errors.push(`${port}: ${e.message}`);
        }
    }

    const errorSummary = errors.length ? `Errors: ${errors.join(', ')}` : 'No ports responding';
    throw new Error(
        `CDP not found on ports ${ports.join(',')}. ${errorSummary}. ` +
        'Is Antigravity started with --remote-debugging-port=9000?'
    );
}

/**
 * Check if CDP is available on a specific port
 * @param {number} port - Port to check
 * @returns {Promise<boolean>}
 */
export async function isCDPAvailable(port = 9000) {
    try {
        const list = await getJson(`http://127.0.0.1:${port}/json/list`);
        return list.length > 0;
    } catch {
        return false;
    }
}
