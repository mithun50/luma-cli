/**
 * CDP State - Application state retrieval
 */

/**
 * Get current app state (mode and model)
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} State object with mode and model
 */
export async function getAppState(cdp) {
    const EXP = `(async () => {
        try {
            const state = { mode: 'Unknown', model: 'Unknown' };

            // 1. Get Mode (Fast/Planning)
            // Strategy: Find the clickable mode button which contains either "Fast" or "Planning"
            // It's usually a button or div with cursor:pointer containing the mode text
            const allEls = Array.from(document.querySelectorAll('*'));

            // Find elements that are likely mode buttons
            for (const el of allEls) {
                if (el.children.length > 0) continue;
                const text = (el.innerText || '').trim();
                if (text !== 'Fast' && text !== 'Planning') continue;

                // Check if this or a parent is clickable (the actual mode selector)
                let current = el;
                for (let i = 0; i < 5; i++) {
                    if (!current) break;
                    const style = window.getComputedStyle(current);
                    if (style.cursor === 'pointer' || current.tagName === 'BUTTON') {
                        state.mode = text;
                        break;
                    }
                    current = current.parentElement;
                }
                if (state.mode !== 'Unknown') break;
            }

            // Fallback: Just look for visible text
            if (state.mode === 'Unknown') {
                const textNodes = allEls.filter(el => el.children.length === 0 && el.innerText);
                if (textNodes.some(el => el.innerText.trim() === 'Planning')) state.mode = 'Planning';
                else if (textNodes.some(el => el.innerText.trim() === 'Fast')) state.mode = 'Fast';
            }

            // 2. Get Model
            // Strategy: Look for button containing a known model keyword
            const KNOWN_MODELS = ["Gemini", "Claude", "GPT"];
            const textNodes = allEls.filter(el => el.children.length === 0 && el.innerText);
            const modelEl = textNodes.find(el => {
                const txt = el.innerText;
                // Avoids "Select Model" placeholder if possible, but usually a model is selected
                return KNOWN_MODELS.some(k => txt.includes(k)) &&
                       // Check if it's near a chevron (likely values in the header)
                       el.closest('button')?.querySelector('svg.lucide-chevron-up');
            });

            if (modelEl) {
                state.model = modelEl.innerText.trim();
            }

            return state;
        } catch(e) { return { error: e.toString() }; }
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
    return { error: 'Context failed' };
}
