/**
 * Antigravity Launcher - Auto-launch Antigravity IDE with debug mode
 */

import { spawn } from 'child_process';
import { isCDPAvailable } from '../cdp/discovery.js';
import { DEFAULTS } from '../config/defaults.js';

/**
 * Check if Antigravity is already running with debug mode enabled
 * @returns {Promise<boolean>}
 */
export async function isAntigravityRunning() {
    for (const port of DEFAULTS.CDP_PORTS) {
        if (await isCDPAvailable(port)) {
            return true;
        }
    }
    return false;
}

/**
 * Launch Antigravity IDE with remote debugging enabled
 * @param {Object} options - Launch options
 * @param {string} options.directory - Working directory (default: '.')
 * @param {number} options.debugPort - Debug port (default: 9000)
 * @param {number} options.timeout - Timeout in ms to wait for CDP (default: 30000)
 * @returns {Promise<{process: ChildProcess, port: number}>}
 */
export async function launchAntigravity(options = {}) {
    const {
        directory = '.',
        debugPort = DEFAULTS.CDP_PORTS[0],
        timeout = 30000
    } = options;

    // Check if already running
    if (await isAntigravityRunning()) {
        return { process: null, port: debugPort, alreadyRunning: true };
    }

    // Spawn Antigravity process with proper error handling
    return new Promise((resolve, reject) => {
        const args = [directory, `--remote-debugging-port=${debugPort}`];

        let antigravityProcess;
        try {
            antigravityProcess = spawn('antigravity', args, {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe']
            });
        } catch (err) {
            reject(new Error(`Failed to spawn Antigravity: ${err.message}`));
            return;
        }

        let spawnError = null;

        // Handle spawn errors (e.g., command not found)
        antigravityProcess.on('error', (err) => {
            spawnError = err;
            reject(new Error(`Failed to launch Antigravity: ${err.message}. Is 'antigravity' in your PATH?`));
        });

        // Wait for CDP to become available
        const checkCDP = async () => {
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                // Check if spawn error occurred
                if (spawnError) {
                    return; // Already rejected
                }

                if (await isCDPAvailable(debugPort)) {
                    resolve({ process: antigravityProcess, port: debugPort, alreadyRunning: false });
                    return;
                }
                // Wait 500ms before checking again
                await new Promise(r => setTimeout(r, 500));
            }

            // Timeout - kill the process if it's running
            if (!spawnError) {
                try {
                    antigravityProcess.kill();
                } catch (e) {
                    // Ignore kill errors
                }
                reject(new Error(`Antigravity started but CDP not available after ${timeout / 1000}s`));
            }
        };

        // Start checking after a small delay to allow error event to fire first
        setTimeout(checkCDP, 100);
    });
}

/**
 * Wait for Antigravity CDP to become available
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} port - Port to check
 * @returns {Promise<boolean>}
 */
export async function waitForAntigravity(timeout = 30000, port = DEFAULTS.CDP_PORTS[0]) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await isCDPAvailable(port)) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return false;
}
