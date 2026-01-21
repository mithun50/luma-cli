/**
 * Server Module - Server orchestrator
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import { CDPManager } from '../cdp/index.js';
import { getServerConfig, getSSLConfig } from '../config/index.js';
import { killPortProcess, getLocalIP } from '../utils/index.js';
import { createExpressApp } from './express.js';
import { createWebSocketServer } from './websocket.js';
import { startPolling, initCDP } from './polling.js';

/**
 * Create and start the Luma server
 * @param {Object} options - Server options
 * @param {number} options.port - Server port
 * @param {string} options.password - App password
 * @returns {Promise<Object>} Server instance and related objects
 */
export async function createServer(options = {}) {
    const serverConfig = getServerConfig();
    const sslConfig = getSSLConfig();

    const port = options.port || serverConfig.port;
    const password = options.password || serverConfig.password;
    const hasSSL = sslConfig.hasSSL;

    // Create CDP manager
    const cdpManager = new CDPManager();

    // Create Express app
    const app = createExpressApp({ cdpManager, password, hasSSL });

    // Create HTTP/HTTPS server
    let server;
    if (hasSSL) {
        const sslOptions = {
            key: fs.readFileSync(sslConfig.keyPath),
            cert: fs.readFileSync(sslConfig.certPath)
        };
        server = https.createServer(sslOptions, app);
    } else {
        server = http.createServer(app);
    }

    // Create WebSocket server
    const wss = createWebSocketServer(server, { password });

    return {
        server,
        wss,
        app,
        cdpManager,
        hasSSL,
        port,
        password
    };
}

/**
 * Start the Luma server
 * @param {Object} options - Server options
 * @returns {Promise<void>}
 */
export async function startServer(options = {}) {
    try {
        const serverInstance = await createServer(options);
        const { server, wss, cdpManager, hasSSL, port } = serverInstance;

        // Try initial CDP connection
        try {
            await initCDP(cdpManager);
        } catch (err) {
            console.warn(`\u26a0\ufe0f  Initial CDP discovery failed: ${err.message}`);
            console.log('\ud83d\udca1 Start Antigravity with --remote-debugging-port=9000 to connect.');
        }

        // Start background polling
        const stopPolling = startPolling(cdpManager, wss);

        // Kill any existing process on the port
        await killPortProcess(port);

        // Start server
        const localIP = getLocalIP();
        const protocol = hasSSL ? 'https' : 'http';

        return new Promise((resolve, reject) => {
            server.listen(port, '0.0.0.0', () => {
                console.log(`\ud83d\ude80 Server running on ${protocol}://${localIP}:${port}`);
                if (hasSSL) {
                    console.log(`\ud83d\udca1 First time on phone? Accept the security warning to proceed.`);
                }

                // Setup graceful shutdown
                const gracefulShutdown = (signal) => {
                    console.log(`\n\ud83d\uded1 Received ${signal}. Shutting down gracefully...`);
                    stopPolling();
                    wss.close(() => console.log('   WebSocket server closed'));
                    server.close(() => console.log('   HTTP server closed'));
                    cdpManager.clear();
                    console.log('   CDP connection closed');
                    setTimeout(() => process.exit(0), 1000);
                };

                process.on('SIGINT', () => gracefulShutdown('SIGINT'));
                process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

                resolve({
                    ...serverInstance,
                    localIP,
                    protocol,
                    url: `${protocol}://${localIP}:${port}`,
                    stopPolling
                });
            });

            server.on('error', reject);
        });
    } catch (err) {
        console.error('\u274c Fatal error:', err.message);
        throw err;
    }
}

export { createExpressApp } from './express.js';
export { createWebSocketServer, broadcast } from './websocket.js';
export { startPolling, initCDP } from './polling.js';
