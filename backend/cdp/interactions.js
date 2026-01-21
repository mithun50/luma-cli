/**
 * CDP Interactions - Click and scroll functionality
 */

/**
 * Click an element remotely
 * @param {Object} cdp - CDP connection object
 * @param {Object} options - Click options
 * @param {string} options.selector - CSS selector
 * @param {number} options.index - Element index
 * @param {string} options.textContent - Optional text content filter
 * @returns {Promise<Object>} Result object
 */
export async function clickElement(cdp, { selector, index = 0, textContent = '' }) {
    const EXP = `(async () => {
        try {
            // Strategy: Find all elements matching the selector
            // If textContent is provided, filter by that too for safety
            let elements = Array.from(document.querySelectorAll('${selector}'));

            if ('${textContent}') {
                elements = elements.filter(el => el.textContent.includes('${textContent}'));
            }

            const target = elements[${index}];

            if (target) {
                target.click();
                return { success: true };
            }

            return { error: 'Element not found at index ${index}' };
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
    return { error: 'Click failed in all contexts' };
}

/**
 * Remote scroll - sync phone scroll to desktop
 * @param {Object} cdp - CDP connection object
 * @param {Object} options - Scroll options
 * @param {number} options.scrollTop - Absolute scroll position
 * @param {number} options.scrollPercent - Percentage-based scroll (0-1)
 * @returns {Promise<Object>} Result object
 */
export async function remoteScroll(cdp, { scrollTop, scrollPercent }) {
    const EXPRESSION = `(async () => {
        try {
            // Find the main scrollable chat container
            const scrollables = [...document.querySelectorAll('#cascade [class*="scroll"], #cascade [style*="overflow"]')]
                .filter(el => el.scrollHeight > el.clientHeight);

            // Also check for the main chat area
            const chatArea = document.querySelector('#cascade .overflow-y-auto, #cascade [data-scroll-area]');
            if (chatArea) scrollables.unshift(chatArea);

            if (scrollables.length === 0) {
                // Fallback: scroll the main cascade element
                const cascade = document.querySelector('#cascade');
                if (cascade && cascade.scrollHeight > cascade.clientHeight) {
                    scrollables.push(cascade);
                }
            }

            if (scrollables.length === 0) return { error: 'No scrollable element found' };

            const target = scrollables[0];

            // Use percentage-based scrolling for better sync
            if (${scrollPercent} !== undefined) {
                const maxScroll = target.scrollHeight - target.clientHeight;
                target.scrollTop = maxScroll * ${scrollPercent};
            } else {
                target.scrollTop = ${scrollTop || 0};
            }

            return { success: true, scrolled: target.scrollTop };
        } catch(e) {
            return { error: e.toString() };
        }
    })()`;

    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: EXPRESSION,
                returnByValue: true,
                awaitPromise: true,
                contextId: ctx.id
            });
            if (res.result?.value?.success) return res.result.value;
        } catch (e) {
            // Continue to next context
        }
    }
    return { error: 'Scroll failed in all contexts' };
}
