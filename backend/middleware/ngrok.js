/**
 * Ngrok Bypass Middleware
 */

/**
 * Create ngrok bypass middleware
 * Adds header to skip ngrok browser warning
 * @returns {Function} Express middleware
 */
export function createNgrokMiddleware() {
    return (req, res, next) => {
        // Tell ngrok to skip the "visit" warning for API requests
        res.setHeader('ngrok-skip-browser-warning', 'true');
        next();
    };
}
