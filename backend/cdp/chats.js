/**
 * CDP Chats - Multi-chat management
 * Interacts with Antigravity's chat sidebar/list
 */

/**
 * Get list of all chats from the sidebar
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} List of chats with active chat info
 */
export async function getChats(cdp) {
    const EXP = `(async () => {
        try {
            const chats = [];
            let activeChat = null;

            // Strategy 1: Look for chat list items in sidebar
            // Common patterns: [data-chat-id], [class*="chat-item"], [class*="conversation"]
            const chatItems = document.querySelectorAll(
                '[data-chat-id], ' +
                '[class*="chat-item"], ' +
                '[class*="conversation-item"], ' +
                '[class*="history-item"], ' +
                '[class*="sidebar"] [class*="item"]:not([class*="menu"])'
            );

            for (const item of chatItems) {
                const chatId = item.getAttribute('data-chat-id') ||
                              item.getAttribute('data-id') ||
                              item.getAttribute('id') ||
                              \`chat-\${chats.length}\`;

                // Get chat name/title
                const titleEl = item.querySelector('[class*="title"], [class*="name"], h3, h4, span');
                const name = titleEl?.textContent?.trim() ||
                            item.textContent?.trim().substring(0, 50) ||
                            'Untitled Chat';

                // Check if this is the active chat
                const isActive = item.classList.contains('active') ||
                                item.classList.contains('selected') ||
                                item.getAttribute('data-active') === 'true' ||
                                item.getAttribute('aria-selected') === 'true';

                // Get timestamp if available
                const timeEl = item.querySelector('[class*="time"], [class*="date"], time');
                const timestamp = timeEl?.textContent?.trim() ||
                                 timeEl?.getAttribute('datetime') ||
                                 null;

                const chat = {
                    id: chatId,
                    name: name.replace(/\\n/g, ' ').trim(),
                    isActive,
                    timestamp
                };

                chats.push(chat);

                if (isActive) {
                    activeChat = chatId;
                }
            }

            // Strategy 2: Check for tabs if sidebar not found
            if (chats.length === 0) {
                const tabs = document.querySelectorAll(
                    '[role="tab"], ' +
                    '[class*="tab"]:not([class*="table"])'
                );

                for (const tab of tabs) {
                    const text = tab.textContent?.trim();
                    if (text && text.length < 100) {
                        const isActive = tab.classList.contains('active') ||
                                        tab.getAttribute('aria-selected') === 'true';
                        const chat = {
                            id: \`tab-\${chats.length}\`,
                            name: text,
                            isActive
                        };
                        chats.push(chat);
                        if (isActive) activeChat = chat.id;
                    }
                }
            }

            return {
                chats,
                activeChat,
                count: chats.length
            };
        } catch(e) {
            return { error: e.toString(), chats: [] };
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
    return { chats: [], error: 'Could not retrieve chats' };
}

/**
 * Create a new chat
 * @param {Object} cdp - CDP connection object
 * @param {string} name - Optional name for the new chat
 * @returns {Promise<Object>} Result of creating the chat
 */
export async function createChat(cdp, name = '') {
    const escapedName = JSON.stringify(name);

    const EXP = `(async () => {
        try {
            const name = ${escapedName};

            // Strategy 1: Look for "New Chat" button
            const newChatBtn = Array.from(document.querySelectorAll('button, [role="button"], a'))
                .find(el => {
                    const text = el.textContent?.toLowerCase() || '';
                    const label = el.getAttribute('aria-label')?.toLowerCase() || '';
                    return text.includes('new chat') ||
                           text.includes('new conversation') ||
                           label.includes('new chat') ||
                           label.includes('new conversation') ||
                           el.querySelector('[class*="plus"], [class*="add"]');
                });

            if (newChatBtn) {
                newChatBtn.click();
                await new Promise(r => setTimeout(r, 300));
                return { success: true, method: 'button_click', message: 'New chat created' };
            }

            // Strategy 2: Keyboard shortcut Ctrl+Shift+N or Ctrl+N
            const shortcuts = [
                { ctrlKey: true, shiftKey: true, key: 'n', code: 'KeyN' },
                { ctrlKey: true, shiftKey: false, key: 'n', code: 'KeyN' },
                { metaKey: true, shiftKey: true, key: 'n', code: 'KeyN' },
            ];

            for (const shortcut of shortcuts) {
                const event = new KeyboardEvent('keydown', {
                    ...shortcut,
                    keyCode: 78,
                    which: 78,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
                await new Promise(r => setTimeout(r, 100));
            }

            return { success: true, method: 'keyboard', message: 'New chat shortcut triggered' };
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
    return { error: 'Failed to create new chat' };
}

/**
 * Switch to a specific chat
 * @param {Object} cdp - CDP connection object
 * @param {string} chatId - ID of the chat to switch to
 * @returns {Promise<Object>} Result of switching
 */
export async function switchChat(cdp, chatId) {
    const escapedId = JSON.stringify(chatId);

    const EXP = `(async () => {
        try {
            const chatId = ${escapedId};

            // Find the chat item by ID
            let chatItem = document.querySelector(\`[data-chat-id="\${chatId}"], [data-id="\${chatId}"], #\${chatId}\`);

            // If not found by ID, try to find by index (for tab-0, tab-1, etc.)
            if (!chatItem && chatId.startsWith('chat-')) {
                const index = parseInt(chatId.split('-')[1]);
                const items = document.querySelectorAll(
                    '[data-chat-id], [class*="chat-item"], [class*="conversation-item"], [class*="history-item"]'
                );
                chatItem = items[index];
            }

            if (!chatItem && chatId.startsWith('tab-')) {
                const index = parseInt(chatId.split('-')[1]);
                const tabs = document.querySelectorAll('[role="tab"], [class*="tab"]:not([class*="table"])');
                chatItem = tabs[index];
            }

            if (chatItem) {
                chatItem.click();
                await new Promise(r => setTimeout(r, 200));
                return { success: true, chatId, message: 'Switched to chat' };
            }

            return { success: false, error: 'Chat not found', chatId };
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
    return { error: 'Failed to switch chat' };
}

/**
 * Delete a chat
 * @param {Object} cdp - CDP connection object
 * @param {string} chatId - ID of the chat to delete
 * @returns {Promise<Object>} Result of deletion
 */
export async function deleteChat(cdp, chatId) {
    const escapedId = JSON.stringify(chatId);

    const EXP = `(async () => {
        try {
            const chatId = ${escapedId};

            // Find the chat item
            let chatItem = document.querySelector(\`[data-chat-id="\${chatId}"], [data-id="\${chatId}"]\`);

            if (!chatItem && chatId.startsWith('chat-')) {
                const index = parseInt(chatId.split('-')[1]);
                const items = document.querySelectorAll(
                    '[data-chat-id], [class*="chat-item"], [class*="conversation-item"]'
                );
                chatItem = items[index];
            }

            if (!chatItem) {
                return { success: false, error: 'Chat not found' };
            }

            // Look for delete/close button within the chat item
            const deleteBtn = chatItem.querySelector(
                '[class*="delete"], [class*="close"], [class*="remove"], ' +
                '[aria-label*="delete"], [aria-label*="remove"], [aria-label*="close"], ' +
                'button[class*="x"], [class*="trash"]'
            );

            if (deleteBtn) {
                deleteBtn.click();
                await new Promise(r => setTimeout(r, 200));

                // Look for confirmation dialog
                const confirmBtn = document.querySelector(
                    '[class*="confirm"] button, [class*="modal"] button[class*="danger"], ' +
                    'button:contains("Delete"), button:contains("Confirm")'
                );
                if (confirmBtn) {
                    confirmBtn.click();
                }

                return { success: true, chatId, message: 'Chat deleted' };
            }

            // Try right-click context menu
            const rightClick = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                clientX: chatItem.getBoundingClientRect().x + 10,
                clientY: chatItem.getBoundingClientRect().y + 10
            });
            chatItem.dispatchEvent(rightClick);
            await new Promise(r => setTimeout(r, 100));

            const deleteMenuItem = Array.from(document.querySelectorAll('[role="menuitem"]'))
                .find(el => el.textContent?.toLowerCase().includes('delete'));

            if (deleteMenuItem) {
                deleteMenuItem.click();
                await new Promise(r => setTimeout(r, 200));
                return { success: true, chatId, method: 'context_menu', message: 'Chat deleted' };
            }

            return { success: false, error: 'Could not find delete option' };
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
    return { error: 'Failed to delete chat' };
}

/**
 * Rename a chat
 * @param {Object} cdp - CDP connection object
 * @param {string} chatId - ID of the chat to rename
 * @param {string} newName - New name for the chat
 * @returns {Promise<Object>} Result of renaming
 */
export async function renameChat(cdp, chatId, newName) {
    const escapedId = JSON.stringify(chatId);
    const escapedName = JSON.stringify(newName);

    const EXP = `(async () => {
        try {
            const chatId = ${escapedId};
            const newName = ${escapedName};

            // Find the chat item
            let chatItem = document.querySelector(\`[data-chat-id="\${chatId}"], [data-id="\${chatId}"]\`);

            if (!chatItem && chatId.startsWith('chat-')) {
                const index = parseInt(chatId.split('-')[1]);
                const items = document.querySelectorAll(
                    '[data-chat-id], [class*="chat-item"], [class*="conversation-item"]'
                );
                chatItem = items[index];
            }

            if (!chatItem) {
                return { success: false, error: 'Chat not found' };
            }

            // Look for edit/rename button
            const editBtn = chatItem.querySelector(
                '[class*="edit"], [class*="rename"], ' +
                '[aria-label*="edit"], [aria-label*="rename"], ' +
                '[class*="pencil"]'
            );

            if (editBtn) {
                editBtn.click();
                await new Promise(r => setTimeout(r, 200));

                // Find the input field
                const input = chatItem.querySelector('input') ||
                             document.querySelector('[class*="modal"] input, [class*="dialog"] input');

                if (input) {
                    input.value = newName;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));

                    // Try to submit
                    const form = input.closest('form');
                    if (form) {
                        form.dispatchEvent(new Event('submit', { bubbles: true }));
                    } else {
                        // Press Enter
                        input.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'Enter',
                            keyCode: 13,
                            bubbles: true
                        }));
                    }

                    return { success: true, chatId, newName, message: 'Chat renamed' };
                }
            }

            // Try double-click to edit inline
            chatItem.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await new Promise(r => setTimeout(r, 200));

            const inlineInput = chatItem.querySelector('input');
            if (inlineInput) {
                inlineInput.value = newName;
                inlineInput.dispatchEvent(new Event('input', { bubbles: true }));
                inlineInput.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter',
                    keyCode: 13,
                    bubbles: true
                }));
                return { success: true, chatId, newName, method: 'inline_edit' };
            }

            return { success: false, error: 'Could not find rename option' };
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
    return { error: 'Failed to rename chat' };
}
