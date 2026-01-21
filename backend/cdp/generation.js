/**
 * CDP Generation State - Detect AI generation status
 */

/**
 * Script to detect if AI is currently generating
 * Looks for:
 * - Stop button visibility
 * - Loading indicators
 * - Streaming text cursors
 * - Animation classes
 */
const GENERATION_DETECT_SCRIPT = `(() => {
    try {
        // Method 1: Check for stop button (most reliable)
        // When generating, a stop button appears
        const stopBtn = document.querySelector('button[aria-label*="stop" i], button[title*="stop" i]');
        if (stopBtn && stopBtn.offsetParent !== null) {
            return { isGenerating: true, method: 'stop_button' };
        }

        // Method 2: Look for stop icon (square icon in button)
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const svg = btn.querySelector('svg');
            if (svg) {
                // Stop icon is usually a square/rectangle
                const rect = svg.querySelector('rect');
                if (rect && btn.offsetParent !== null) {
                    const btnText = btn.innerText?.toLowerCase() || '';
                    const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
                    if (btnText.includes('stop') || ariaLabel.includes('stop')) {
                        return { isGenerating: true, method: 'stop_icon' };
                    }
                }
            }
        }

        // Method 3: Check for loading/spinner animations
        const spinners = document.querySelectorAll('[class*="animate-spin"], [class*="loading"], [class*="spinner"]');
        for (const spinner of spinners) {
            if (spinner.offsetParent !== null) {
                return { isGenerating: true, method: 'spinner' };
            }
        }

        // Method 4: Check for streaming cursor (blinking cursor at end of message)
        const cursors = document.querySelectorAll('[class*="cursor"], [class*="caret"]');
        for (const cursor of cursors) {
            if (cursor.offsetParent !== null) {
                const style = window.getComputedStyle(cursor);
                if (style.animation || style.animationName !== 'none') {
                    return { isGenerating: true, method: 'cursor' };
                }
            }
        }

        // Method 5: Check for "thinking" or processing indicators
        const thinkingEls = document.querySelectorAll('[class*="thinking"], [class*="processing"]');
        for (const el of thinkingEls) {
            if (el.offsetParent !== null) {
                return { isGenerating: true, method: 'thinking' };
            }
        }

        // Method 6: Check if input is disabled (often disabled during generation)
        const input = document.querySelector('[contenteditable="true"]');
        if (input) {
            const isDisabled = input.getAttribute('contenteditable') === 'false' ||
                              input.getAttribute('aria-disabled') === 'true' ||
                              input.classList.contains('disabled');
            if (isDisabled) {
                return { isGenerating: true, method: 'input_disabled' };
            }
        }

        return { isGenerating: false, method: 'none' };
    } catch(e) {
        return { isGenerating: false, error: e.toString() };
    }
})()`;

/**
 * Check if AI is currently generating a response
 * @param {Object} cdp - CDP connection object
 * @returns {Promise<Object>} Generation state { isGenerating: boolean, method: string }
 */
export async function checkGenerationState(cdp) {
    for (const ctx of cdp.contexts) {
        try {
            const res = await cdp.call('Runtime.evaluate', {
                expression: GENERATION_DETECT_SCRIPT,
                returnByValue: true,
                contextId: ctx.id
            });
            if (res.result?.value) {
                return res.result.value;
            }
        } catch (e) {
            // Continue to next context
        }
    }
    return { isGenerating: false, error: 'Context failed' };
}
