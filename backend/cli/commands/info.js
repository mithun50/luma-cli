/**
 * Info Command - Show connection info
 */

import chalk from 'chalk';
import { getServerConfig, getSSLConfig } from '../../config/index.js';
import { getLocalIP } from '../../utils/index.js';
import { displayQRCode, displayConnectionInfo, displayConnectionSteps } from '../qrcode.js';
import { getTunnelStatus } from '../tunnel.js';

/**
 * Info command handler
 */
export async function infoCommand() {
    const serverConfig = getServerConfig();
    const sslConfig = getSSLConfig();
    const localIP = getLocalIP();

    const protocol = sslConfig.hasSSL ? 'https' : 'http';
    const localUrl = `${protocol}://${localIP}:${serverConfig.port}`;

    console.log(chalk.cyan.bold('\n\ud83d\udcf1 Luma-CLI Connection Info\n'));
    console.log(chalk.gray('='.repeat(50)));

    // Local connection info
    console.log(chalk.white.bold('\n\ud83d\udce1 Local Connection (WiFi):'));
    console.log(chalk.white(`   URL: ${chalk.green(localUrl)}`));
    console.log(chalk.gray('   Authentication: Auto (same network)'));

    // Display QR for local
    console.log(chalk.cyan('\n   Local QR Code:'));
    displayQRCode(localUrl, { small: true });

    // Check for active tunnel
    const tunnelStatus = await getTunnelStatus();
    if (tunnelStatus.active && tunnelStatus.tunnels.length > 0) {
        console.log(chalk.white.bold('\n\ud83c\udf0d Web Connection (ngrok):'));
        for (const tunnel of tunnelStatus.tunnels) {
            console.log(chalk.white(`   URL: ${chalk.green(tunnel.public_url)}`));
        }
        console.log(chalk.gray('   Authentication: Password required'));
    } else {
        console.log(chalk.gray('\n\ud83c\udf0d Web Connection: Not active'));
        console.log(chalk.gray('   Run `luma-cli start --web` to enable'));
    }

    console.log(chalk.gray('\n' + '='.repeat(50)));

    // Server status
    console.log(chalk.white.bold('\n\u2699\ufe0f  Server Configuration:'));
    console.log(chalk.white(`   Port: ${chalk.cyan(serverConfig.port)}`));
    console.log(chalk.white(`   HTTPS: ${sslConfig.hasSSL ? chalk.green('Enabled') : chalk.yellow('Disabled')}`));
    console.log(chalk.white(`   Password: ${serverConfig.password === 'antigravity' ? chalk.gray('(default)') : chalk.green('Custom')}`));

    console.log(chalk.gray('\n' + '='.repeat(50)));

    // Quick tips
    console.log(chalk.cyan.bold('\n\ud83d\udca1 Quick Tips:'));
    console.log(chalk.gray('   \u2022 Use `luma-cli start` to start the server'));
    console.log(chalk.gray('   \u2022 Use `luma-cli config set password <pass>` to set password'));
    console.log(chalk.gray('   \u2022 Use `luma-cli ssl generate` to enable HTTPS'));
    console.log('');
}
