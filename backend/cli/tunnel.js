/**
 * Ngrok Tunnel Management
 */

import ngrok from 'ngrok';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Create ngrok tunnel
 * @param {Object} options - Tunnel options
 * @param {number} options.port - Local port to tunnel
 * @param {string} options.authToken - Ngrok auth token
 * @param {boolean} options.https - Whether local server uses HTTPS
 * @returns {Promise<string>} Public tunnel URL
 */
export async function createTunnel(options = {}) {
    const { port = 3000, authToken, https = false } = options;

    const spinner = ora('Establishing ngrok tunnel...').start();

    try {
        // Set auth token if provided
        if (authToken) {
            await ngrok.authtoken(authToken);
        } else {
            spinner.warn('NGROK_AUTHTOKEN not found. Tunnel might expire quickly.');
        }

        const protocol = https ? 'https' : 'http';
        const addr = `${protocol}://localhost:${port}`;

        const url = await ngrok.connect({
            addr,
            host_header: 'rewrite'
        });

        spinner.succeed(`Tunnel established: ${chalk.green(url)}`);
        return url;
    } catch (error) {
        spinner.fail(`Failed to create tunnel: ${error.message}`);
        throw error;
    }
}

/**
 * Close ngrok tunnel
 */
export async function closeTunnel() {
    try {
        await ngrok.kill();
    } catch {
        // Ignore errors during cleanup
    }
}

/**
 * Get ngrok status
 * @returns {Promise<Object>} Ngrok status
 */
export async function getTunnelStatus() {
    try {
        const api = ngrok.getApi();
        if (api) {
            const tunnels = await api.listTunnels();
            return {
                active: tunnels.tunnels.length > 0,
                tunnels: tunnels.tunnels
            };
        }
        return { active: false, tunnels: [] };
    } catch {
        return { active: false, tunnels: [] };
    }
}
