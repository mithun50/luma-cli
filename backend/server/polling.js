/**
 * Snapshot Polling Loop
 */

import WebSocket from 'ws';
import { DEFAULTS } from '../config/defaults.js';
import { discoverCDP, connectCDP, captureSnapshot, checkGenerationState } from '../cdp/index.js';
import { hashString } from '../utils/hash.js';

/**
 * Initialize CDP connection
 * @param {Object} cdpManager - CDP manager instance
 * @returns {Promise<void>}
 */
export async function initCDP(cdpManager) {
    console.log('\ud83d\udd0d Discovering Antigravity CDP endpoint...');
    const cdpInfo = await discoverCDP();
    console.log(`\u2705 Found Antigravity on port ${cdpInfo.port}`);

    console.log('\ud83d\udd0c Connecting to CDP...');
    cdpManager.cdp = await connectCDP(cdpInfo.url);
    console.log(`\u2705 Connected! Found ${cdpManager.cdp.contexts.length} execution contexts\n`);
}

/**
 * Start background polling for snapshots
 * @param {Object} cdpManager - CDP manager instance
 * @param {WebSocketServer} wss - WebSocket server for broadcasting
 * @returns {Function} Stop polling function
 */
export function startPolling(cdpManager, wss) {
    let lastErrorLog = 0;
    let isConnecting = false;
    let isRunning = true;

    const poll = async () => {
        if (!isRunning) return;

        if (!cdpManager.isConnected()) {
            if (!isConnecting) {
                console.log('\ud83d\udd0d Looking for Antigravity CDP connection...');
                isConnecting = true;
            }
            if (cdpManager.cdp) {
                // Was connected, now lost
                console.log('\ud83d\udd04 CDP connection lost. Attempting to reconnect...');
                cdpManager.clear();
            }
            try {
                await initCDP(cdpManager);
                if (cdpManager.isConnected()) {
                    console.log('\u2705 CDP Connection established from polling loop');
                    isConnecting = false;
                }
            } catch (err) {
                // Not found yet, just wait for next cycle
            }
            setTimeout(poll, DEFAULTS.RECONNECT_INTERVAL);
            return;
        }

        try {
            const snapshot = await captureSnapshot(cdpManager.cdp);
            if (snapshot && !snapshot.error) {
                const hash = hashString(snapshot.html);

                // Check generation state
                const genState = await checkGenerationState(cdpManager.cdp);
                const wasGenerating = cdpManager.wasGenerating;
                const isGenerating = genState.isGenerating;

                // Detect generation complete (was generating, now stopped)
                if (wasGenerating && !isGenerating) {
                    const duration = cdpManager.getGenerationState().duration;
                    console.log(`\u2705 Generation complete! (${Math.round(duration / 1000)}s)`);

                    // Broadcast generation complete to all clients
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'generation_complete',
                                duration: duration,
                                timestamp: new Date().toISOString()
                            }));
                        }
                    });

                    cdpManager.resetGenerationState();
                }

                // Detect generation started
                if (!wasGenerating && isGenerating) {
                    console.log(`\u23f3 Generation started...`);

                    // Broadcast generation started
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'generation_started',
                                timestamp: new Date().toISOString()
                            }));
                        }
                    });
                }

                // Update generation state
                cdpManager.setGenerating(isGenerating);

                // Only update if content changed
                if (hash !== cdpManager.getSnapshotHash()) {
                    cdpManager.updateSnapshot(snapshot, hash);

                    // Broadcast to all connected clients
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'snapshot_update',
                                isGenerating: isGenerating,
                                timestamp: new Date().toISOString()
                            }));
                        }
                    });

                    console.log(`\ud83d\udcf8 Snapshot updated (hash: ${hash})`);
                }
            } else {
                // Snapshot is null or has error
                const now = Date.now();
                if (!lastErrorLog || now - lastErrorLog > 10000) {
                    const errorMsg = snapshot?.error || 'No valid snapshot captured (check contexts)';
                    console.warn(`\u26a0\ufe0f  Snapshot capture issue: ${errorMsg}`);
                    if (errorMsg === 'cascade not found') {
                        console.log('   (Tip: Ensure an active chat is open in Antigravity)');
                    }
                    if (cdpManager.cdp.contexts.length === 0) {
                        console.log('   (Tip: No active execution contexts found. Try interacting with the Antigravity window)');
                    }
                    lastErrorLog = now;
                }
            }
        } catch (err) {
            console.error('Poll error:', err.message);
        }

        setTimeout(poll, DEFAULTS.POLL_INTERVAL);
    };

    poll();

    // Return stop function
    return () => {
        isRunning = false;
    };
}
