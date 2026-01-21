/**
 * Authentication Routes
 */

import { Router } from 'express';
import { getAuthToken } from '../middleware/auth.js';
import { DEFAULTS } from '../config/defaults.js';

/**
 * Create auth router
 * @param {Object} options - Router options
 * @param {string} options.password - App password
 * @returns {Router} Express router
 */
export function createAuthRouter(options = {}) {
    const router = Router();
    const { password = DEFAULTS.DEFAULT_PASSWORD } = options;
    const authToken = getAuthToken(password);

    // Login page
    router.get('/login', (req, res) => {
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Luma-CLI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
            width: 100%;
            max-width: 400px;
        }
        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 2rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        input {
            width: 100%;
            padding: 1rem;
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem;
            background: rgba(255,255,255,0.05);
            color: #fff;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus {
            border-color: #6366f1;
        }
        input::placeholder {
            color: #64748b;
        }
        button {
            width: 100%;
            padding: 1rem;
            border: none;
            border-radius: 0.5rem;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        button:hover {
            opacity: 0.9;
        }
        .error {
            color: #ef4444;
            margin-top: 1rem;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">LUMA-CLI</div>
        <form id="loginForm">
            <div class="form-group">
                <input type="password" id="password" placeholder="Enter password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <p class="error" id="error">Invalid password</p>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await res.json();
                if (data.success) {
                    window.location.href = '/';
                } else {
                    document.getElementById('error').style.display = 'block';
                }
            } catch (err) {
                document.getElementById('error').style.display = 'block';
            }
        });
    </script>
</body>
</html>
        `);
    });

    // Login endpoint
    router.post('/login', (req, res) => {
        const { password: inputPassword } = req.body;
        if (inputPassword === password) {
            res.cookie(DEFAULTS.AUTH_COOKIE_NAME, authToken, {
                httpOnly: true,
                signed: true,
                maxAge: DEFAULTS.COOKIE_MAX_AGE
            });
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
        }
    });

    // Logout endpoint
    router.post('/logout', (req, res) => {
        res.clearCookie(DEFAULTS.AUTH_COOKIE_NAME);
        res.json({ success: true });
    });

    return router;
}
