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
