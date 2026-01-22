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

    // Spawn Antigravity process
    const args = [directory, `--remote-debugging-port=${debugPort}`];

    const antigravityProcess = spawn('antigravity', args, {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    // Handle spawn errors
    antigravityProcess.on('error', (err) => {
        throw new Error(`Failed to launch Antigravity: ${err.message}. Is 'antigravity' in your PATH?`);
    });

    // Wait for CDP to become available
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await isCDPAvailable(debugPort)) {
            return { process: antigravityProcess, port: debugPort, alreadyRunning: false };
        }
        // Wait 500ms before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Timeout - kill the process and throw error
    antigravityProcess.kill();
    throw new Error(`Antigravity started but CDP not available after ${timeout / 1000}s`);
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
