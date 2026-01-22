/**
 * CDP Module - Chrome DevTools Protocol integration
 * Main exports for CDP functionality
 */

import WebSocket from 'ws';

// Discovery
export { discoverCDP, isCDPAvailable } from './discovery.js';

// Connection
export { connectCDP, isCDPConnected, closeCDP } from './connection.js';

// Snapshot
export { captureSnapshot } from './snapshot.js';

// Messaging
export { injectMessage, stopGeneration } from './messaging.js';

// Settings
export { setMode, setModel } from './settings.js';

// Interactions
export { clickElement, remoteScroll } from './interactions.js';

// State
export { getAppState } from './state.js';

// Generation
export { checkGenerationState } from './generation.js';

// Workspace
export { getWorkspaceInfo, openFolderDialog, openDirectory, listRecentWorkspaces, closeWorkspace } from './workspace.js';

// Chats (Multi-chat management)
export { getChats, createChat, switchChat, deleteChat, renameChat } from './chats.js';

/**
 * CDP State Manager - Manages CDP connection and snapshot state
 */
export class CDPManager {
    constructor() {
        this.connection = null;
        this.lastSnapshot = null;
        this.lastSnapshotHash = null;
        this.wasGenerating = false;
        this.generationStartTime = null;
    }

    get cdp() {
        return this.connection;
    }

    set cdp(value) {
        this.connection = value;
    }

    isConnected() {
        return this.connection?.ws?.readyState === WebSocket.OPEN;
    }

    updateSnapshot(snapshot, hash) {
        this.lastSnapshot = snapshot;
        this.lastSnapshotHash = hash;
    }

    getSnapshot() {
        return this.lastSnapshot;
    }

    getSnapshotHash() {
        return this.lastSnapshotHash;
    }

    clear() {
        if (this.connection?.ws) {
            this.connection.ws.close();
        }
        this.connection = null;
    }

    // Generation state tracking
    setGenerating(isGenerating) {
        if (isGenerating && !this.wasGenerating) {
            // Generation started
            this.generationStartTime = Date.now();
        }
        this.wasGenerating = isGenerating;
    }

    getGenerationState() {
        return {
            isGenerating: this.wasGenerating,
            startTime: this.generationStartTime,
            duration: this.generationStartTime ? Date.now() - this.generationStartTime : 0
        };
    }

    resetGenerationState() {
        this.wasGenerating = false;
        this.generationStartTime = null;
    }
}
