/**
 * CDP Workspace - Directory and workspace operations
 */

/**
 * Get current workspace/directory info
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} Workspace info with current directory
 */
export async function getWorkspaceInfo(cdp) {
    const EXP = `(async () => {
        try {
            const info = {
                directory: null,
                projectName: null,
                files: []
            };

            // Strategy 1: Check window title for directory
            const title = document.title || '';
            if (title) {
                // Common patterns: "ProjectName - Antigravity" or "path/to/dir - Antigravity"
                const parts = title.split(' - ');
                if (parts.length > 0) {
                    info.projectName = parts[0].trim();
                }
            }

            // Strategy 2: Look for breadcrumb/path in explorer panel
            const pathElements = document.querySelectorAll(
                '[class*="breadcrumb"], [class*="path"], [class*="explorer"] [class*="title"]'
            );
            for (const el of pathElements) {
                const text = el.textContent?.trim();
                if (text && (text.includes('/') || text.includes('\\\\'))) {
                    info.directory = text;
                    break;
                }
            }

            // Strategy 3: Look for folder name in sidebar/explorer header
            const explorerHeaders = document.querySelectorAll(
                '[class*="sidebar"] [class*="header"], [class*="explorer"] [class*="header"]'
            );
            for (const el of explorerHeaders) {
                const text = el.textContent?.trim();
                if (text && text.length > 0 && text.length < 100) {
                    if (!info.projectName) info.projectName = text;
                    break;
                }
            }

            // Strategy 4: Try to get from any data attributes
            const rootEl = document.querySelector('[data-root-path], [data-workspace], [data-folder]');
            if (rootEl) {
                info.directory = rootEl.dataset.rootPath ||
                                rootEl.dataset.workspace ||
                                rootEl.dataset.folder;
            }

            return info;
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value && !res.result.value.error) {
                return res.result.value;
            }
        } catch (e) {
            // Continue to next context
        }
    }
    return { error: 'Could not get workspace info' };
}

/**
 * Open folder dialog via keyboard shortcut
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} Result object
 */
export async function openFolderDialog(cdp) {
    const EXP = `(async () => {
        try {
            // Simulate Ctrl+O / Cmd+O to open folder dialog
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

            const event = new KeyboardEvent('keydown', {
                key: 'o',
                code: 'KeyO',
                keyCode: 79,
                which: 79,
                ctrlKey: !isMac,
                metaKey: isMac,
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(event);

            return { success: true, message: 'Open folder dialog triggered' };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
        } catch (e) {
            // Continue to next context
        }
    }
    return { error: 'Failed to trigger open folder dialog' };
}

/**
 * Try to open a specific directory using slash command
 * This injects a /cd or /open command into the chat
 * @param {Object} cdp - CDP connection object
 * @param {string} directory - Directory path to open
 * @returns {Promise<Object>} Result object
 */
export async function openDirectory(cdp, directory) {
    // Escape the directory path for JavaScript
    const escapedDir = JSON.stringify(directory);

    const EXP = `(async () => {
        try {
            const dir = ${escapedDir};

            // Strategy 1: Try command palette if available
            // Look for command palette trigger
            const cmdPalette = document.querySelector('[class*="command-palette"], [data-command-palette]');
            if (cmdPalette) {
                // Trigger command palette and type "open folder"
                const event = new KeyboardEvent('keydown', {
                    key: 'p',
                    code: 'KeyP',
                    keyCode: 80,
                    which: 80,
                    ctrlKey: true,
                    shiftKey: true,
                    bubbles: true
                });
                document.dispatchEvent(event);

                await new Promise(r => setTimeout(r, 200));

                // Type "open folder"
                const input = document.querySelector('[class*="command-palette"] input, [class*="quick-open"] input');
                if (input) {
                    input.value = 'Open Folder';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }

            // Strategy 2: Look for "Open Folder" button/menu item
            const openFolderBtn = Array.from(document.querySelectorAll('button, [role="menuitem"], [class*="menu-item"]'))
                .find(el => el.textContent?.toLowerCase().includes('open folder'));

            if (openFolderBtn) {
                openFolderBtn.click();
                return { success: true, method: 'button_click', message: 'Clicked Open Folder button' };
            }

            // Strategy 3: Try using the File menu
            const fileMenu = Array.from(document.querySelectorAll('[class*="menu"], [role="menu"]'))
                .find(el => el.textContent?.toLowerCase().includes('file'));

            if (fileMenu) {
                fileMenu.click();
                await new Promise(r => setTimeout(r, 100));

                const openItem = Array.from(document.querySelectorAll('[role="menuitem"]'))
                    .find(el => el.textContent?.toLowerCase().includes('open'));
                if (openItem) {
                    openItem.click();
                    return { success: true, method: 'file_menu', message: 'Opened via File menu' };
                }
            }

            return {
                success: false,
                message: 'Could not find open folder UI. Use keyboard shortcut Ctrl+O on desktop.',
                directory: dir
            };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
        } catch (e) {
            // Continue to next context
        }
    }
    return { error: 'Failed to open directory' };
}

/**
 * List recent workspaces/directories if available
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} List of recent workspaces
 */
/**
 * Close the current workspace/folder
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} Result of closing workspace
 */
export async function closeWorkspace(cdp) {
    const EXP = `(async () => {
        try {
            // Strategy 1: Look for "Close Folder" or "Close Workspace" menu item
            const closeBtn = Array.from(document.querySelectorAll('button, [role="menuitem"], [class*="menu-item"]'))
                .find(el => {
                    const text = el.textContent?.toLowerCase() || '';
                    return text.includes('close folder') ||
                           text.includes('close workspace') ||
                           text.includes('close project');
                });

            if (closeBtn) {
                closeBtn.click();
                return { success: true, method: 'button_click', message: 'Workspace closed' };
            }

            // Strategy 2: Keyboard shortcut Ctrl+K F (VS Code style)
            const ctrlK = new KeyboardEvent('keydown', {
                key: 'k',
                code: 'KeyK',
                keyCode: 75,
                ctrlKey: true,
                bubbles: true
            });
            document.dispatchEvent(ctrlK);
            await new Promise(r => setTimeout(r, 100));

            const fKey = new KeyboardEvent('keydown', {
                key: 'f',
                code: 'KeyF',
                keyCode: 70,
                bubbles: true
            });
            document.dispatchEvent(fKey);

            return { success: true, method: 'keyboard', message: 'Close workspace shortcut triggered' };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value) return res.result.value;
        } catch (e) {
            // Continue to next context
        }
    }
    return { error: 'Failed to close workspace' };
}

/**
 * List recent workspaces/directories if available
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} List of recent workspaces
 */
export async function listRecentWorkspaces(cdp) {
    const EXP = `(async () => {
        try {
            const workspaces = [];

            // Look for recent files/folders list in UI
            const recentItems = document.querySelectorAll(
                '[class*="recent"] [class*="item"], ' +
                '[class*="history"] [class*="item"], ' +
                '[class*="workspace"] [class*="item"]'
            );

            for (const item of recentItems) {
                const path = item.getAttribute('data-path') ||
                            item.getAttribute('title') ||
                            item.textContent?.trim();
                if (path && (path.includes('/') || path.includes('\\\\'))) {
                    workspaces.push({
                        path: path,
                        name: path.split(/[\\/]/).pop()
                    });
                }
            }

            // Check localStorage for recent workspaces
            try {
                const stored = localStorage.getItem('recentWorkspaces') ||
                              localStorage.getItem('recent-folders') ||
                              localStorage.getItem('workspaceHistory');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        for (const ws of parsed) {
                            const path = typeof ws === 'string' ? ws : ws.path;
                            if (path) {
                                workspaces.push({
                                    path: path,
                                    name: path.split(/[\\/]/).pop()
                                });
                            }
                        }
                    }
                }
            } catch(e) {}

            // Deduplicate
            const unique = [...new Map(workspaces.map(w => [w.path, w])).values()];

            return { workspaces: unique };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: EXP,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value && !res.result.value.error) {
                return res.result.value;
            }
        } catch (e) {
            // Continue to next context
        }
    }
    return { workspaces: [] };
}
