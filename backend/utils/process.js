/**
 * Process utilities for Luma-CLI
 */

import { execSync } from 'child_process';

/**
 * Kill any existing process on a given port (prevents EADDRINUSE)
 * @param {number} port - Port number to free
 * @returns {Promise<void>}
 */
export async function killPortProcess(port) {
    try {
        if (process.platform === 'win32') {
            // Windows: Find PID using netstat and kill it
            const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            const lines = result.trim().split('\n');
            const pids = new Set();
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') pids.add(pid);
            }
            for (const pid of pids) {
                try {
                    execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                    console.log(`\u26a0\ufe0f  Killed existing process on port ${port} (PID: ${pid})`);
                } catch (e) { /* Process may have already exited */ }
            }
        } else {
            // Linux/macOS: Use lsof and kill
            const result = execSync(`lsof -ti:${port}`, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            const pids = result.trim().split('\n').filter(p => p);
            for (const pid of pids) {
                try {
                    execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
                    console.log(`\u26a0\ufe0f  Killed existing process on port ${port} (PID: ${pid})`);
                } catch (e) { /* Process may have already exited */ }
            }
        }
        // Small delay to let the port be released
        return new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
        // No process found on port - this is fine
        return Promise.resolve();
    }
}

/**
 * Check if a command exists in PATH
 * @param {string} command - Command to check
 * @returns {boolean}
 */
export function commandExists(command) {
    try {
        const cmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
        execSync(cmd, { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}
