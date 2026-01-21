/**
 * Start Command - Main server start command
 */

import chalk from 'chalk';
import ora from 'ora';
import { startServer } from '../../server/index.js';
import { getServerConfig, getSSLConfig, getNgrokConfig } from '../../config/index.js';
import { generatePasscode, getLocalIP, logger } from '../../utils/index.js';
import { displayQRCode, displayConnectionInfo, displayConnectionSteps } from '../qrcode.js';
import { createTunnel, closeTunnel } from '../tunnel.js';
import { promptMode } from '../prompts.js';

/**
 * Start command handler
 * @param {Object} options - Command options
 */
export async function startCommand(options = {}) {
    // Display banner
    logger.banner();

    // Determine mode
    let mode = 'local';
    if (options.web) {
        mode = 'web';
    } else if (!options.local && !options.web) {
        // Interactive mode selection
        mode = await promptMode();
    }

    const serverConfig = getServerConfig();
    const sslConfig = getSSLConfig();
    const ngrokConfig = getNgrokConfig();

    const port = parseInt(options.port, 10) || serverConfig.port;
    let password = serverConfig.password;

    // Generate passcode for web mode if no password set
    if (mode === 'web' && password === 'antigravity') {
        password = generatePasscode();
        process.env.APP_PASSWORD = password;
        console.log(chalk.yellow(`\u26a0\ufe0f  Using temporary passcode: ${chalk.bold(password)}`));
    }

    console.log(chalk.cyan(`\n\ud83d\ude80 Starting Luma server in ${mode.toUpperCase()} mode...`));

    try {
        // Start the server
        const serverInstance = await startServer({ port, password });
        const { url, hasSSL, localIP } = serverInstance;

        let finalUrl = url;
        let tunnelUrl = null;

        // Setup ngrok tunnel for web mode
        if (mode === 'web') {
            try {
                tunnelUrl = await createTunnel({
                    port,
                    authToken: ngrokConfig.authToken,
                    https: hasSSL
                });
                finalUrl = `${tunnelUrl}?key=${password}`;
            } catch (error) {
                console.log(chalk.red(`\u274c Failed to create tunnel: ${error.message}`));
                console.log(chalk.yellow('Falling back to local mode...'));
                mode = 'local';
                finalUrl = url;
            }
        }

        // Display connection info
        displayConnectionInfo({
            mode,
            url: mode === 'web' ? tunnelUrl : url,
            passcode: mode === 'web' ? password : null,
            localAuth: mode === 'local'
        });

        // Display QR code
        displayQRCode(finalUrl);

        // Display connection steps
        displayConnectionSteps(mode);

        console.log(chalk.cyan('\n\u2705 Server is running. Logs will appear below.'));
        console.log(chalk.gray('\u2328\ufe0f  Press Ctrl+C to stop.\n'));

        // Handle shutdown
        const cleanup = async () => {
            console.log(chalk.yellow('\n\n\ud83d\udc4b Shutting down...'));
            if (mode === 'web') {
                await closeTunnel();
            }
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        console.error(chalk.red(`\u274c Failed to start server: ${error.message}`));
        process.exit(1);
    }
}
