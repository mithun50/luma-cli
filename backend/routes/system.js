/**
 * System Routes - Health, SSL status, SSL generation
 */

import { Router } from 'express';
import { execSync } from 'child_process';
import { getSSLConfig, PROJECT_ROOT } from '../config/index.js';

/**
 * Create system router
 * @param {Object} options - Router options
 * @param {Object} options.cdpManager - CDP manager instance
 * @param {boolean} options.hasSSL - Whether SSL is enabled
 * @returns {Router} Express router
 */
export function createSystemRouter(options = {}) {
    const router = Router();
    const { cdpManager, hasSSL = false } = options;

    // Root endpoint - Landing page
    router.get('/', (req, res) => {
        const connected = cdpManager?.isConnected() || false;
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luma-CLI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        .logo {
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        .tagline {
            color: #94a3b8;
            margin-bottom: 2rem;
        }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: rgba(255,255,255,0.1);
            border-radius: 2rem;
            margin-bottom: 2rem;
        }
        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${connected ? '#10b981' : '#ef4444'};
            animation: ${connected ? 'pulse 2s infinite' : 'none'};
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .endpoints {
            background: rgba(0,0,0,0.3);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
        }
        .endpoints h3 {
            margin-bottom: 1rem;
            color: #8b5cf6;
        }
        .endpoint {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .endpoint:last-child { border: none; }
        .method {
            color: #10b981;
            font-weight: bold;
            font-size: 0.75rem;
        }
        .path { color: #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">LUMA-CLI</div>
        <p class="tagline">Remote Control for Antigravity IDE</p>
        <div class="status">
            <span class="dot"></span>
            <span>${connected ? 'Connected to Antigravity' : 'Not Connected'}</span>
        </div>
        <div class="endpoints">
            <h3>API Endpoints</h3>
            <div class="endpoint"><span class="method">GET</span><span class="path">/health</span></div>
            <div class="endpoint"><span class="method">GET</span><span class="path">/snapshot</span></div>
            <div class="endpoint"><span class="method">POST</span><span class="path">/send</span></div>
            <div class="endpoint"><span class="method">POST</span><span class="path">/stop</span></div>
            <div class="endpoint"><span class="method">POST</span><span class="path">/login</span></div>
            <div class="endpoint"><span class="method">GET</span><span class="path">/app-state</span></div>
        </div>
    </div>
</body>
</html>
        `);
    });

    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            cdpConnected: cdpManager.isConnected(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            https: hasSSL
        });
    });

    // SSL status endpoint
    router.get('/ssl-status', (req, res) => {
        const sslConfig = getSSLConfig();
        res.json({
            enabled: hasSSL,
            certsExist: sslConfig.hasSSL,
            message: hasSSL ? 'HTTPS is active' :
                sslConfig.hasSSL ? 'Certificates exist, restart server to enable HTTPS' :
                    'No certificates found'
        });
    });

    // Generate SSL certificates endpoint
    router.post('/generate-ssl', async (req, res) => {
        try {
            execSync('node generate_ssl.js', { cwd: PROJECT_ROOT, stdio: 'pipe' });
            res.json({
                success: true,
                message: 'SSL certificates generated! Restart the server to enable HTTPS.'
            });
        } catch (e) {
            res.status(500).json({
                success: false,
                error: e.message
            });
        }
    });

    return router;
}
