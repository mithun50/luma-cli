/**
 * CDP Snapshot - DOM capture functionality
 */

/**
 * Script to capture chat snapshot from Antigravity
 */
const CAPTURE_SCRIPT = `(() => {
    const cascade = document.getElementById('cascade');
    if (!cascade) {
        // Debug info
        const body = document.body;
        const childIds = Array.from(body.children).map(c => c.id).filter(id => id).join(', ');
        return { error: 'cascade not found', debug: { hasBody: !!body, availableIds: childIds } };
    }

    const cascadeStyles = window.getComputedStyle(cascade);

    // Find the main scrollable container
    const scrollContainer = cascade.querySelector('.overflow-y-auto, [data-scroll-area]') || cascade;
    const scrollInfo = {
        scrollTop: scrollContainer.scrollTop,
        scrollHeight: scrollContainer.scrollHeight,
        clientHeight: scrollContainer.clientHeight,
        scrollPercent: scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight) || 0
    };

    // Clone cascade to modify it without affecting the original
    const clone = cascade.cloneNode(true);

    // Remove the input box / chat window (last direct child div containing contenteditable)
    const inputContainer = clone.querySelector('[contenteditable="true"]')?.closest('div[id^="cascade"] > div');
    if (inputContainer) {
        inputContainer.remove();
    }

    const html = clone.outerHTML;

    const rules = [];
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                rules.push(rule.cssText);
            }
        } catch (e) { }
    }
    const allCSS = rules.join('\\n');

    return {
        html: html,
        css: allCSS,
        backgroundColor: cascadeStyles.backgroundColor,
        color: cascadeStyles.color,
        fontFamily: cascadeStyles.fontFamily,
        scrollInfo: scrollInfo,
        stats: {
            nodes: clone.getElementsByTagName('*').length,
            htmlSize: html.length,
            cssSize: allCSS.length
        }
    };
})()`;

/**
 * Capture chat snapshot from Antigravity
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object|null>} Snapshot data or null
 */
export async function captureSnapshot(cdp) {
    for (const ctx of cdp.contexts) {
        try {
            const result = await cdp.call('Runtime.evaluate', {
                expression: CAPTURE_SCRIPT,
                returnByValue: true,
                contextId: ctx.id
            });

            if (result.exceptionDetails) {
                continue;
            }

            if (result.result && result.result.value) {
                const val = result.result.value;
                if (!val.error) {
                    return val;
                }
            }
        } catch (e) {
            console.log(`Context ${ctx.id} connection error:`, e.message);
        }
    }

    return null;
}
