/**
 * SSL Command - SSL certificate management
 */

import chalk from 'chalk';
import { generateSSL, getSSLStatus } from '../../ssl/index.js';
import { confirm } from '../prompts.js';

/**
 * SSL command handler
 * @param {string} action - Action (generate, status)
 */
export async function sslCommand(action) {
    // Default to status if no action
    if (!action) {
        action = 'status';
    }

    switch (action) {
        case 'generate':
            await generateSSLCerts();
            break;

        case 'status':
            showSSLStatus();
            break;

        default:
            console.log(chalk.red(`Unknown action: ${action}`));
            console.log(chalk.gray('Available actions: generate, status'));
    }
}

/**
 * Generate SSL certificates
 */
async function generateSSLCerts() {
    const status = getSSLStatus();

    if (status.exists) {
        console.log(chalk.yellow('\u26a0\ufe0f  SSL certificates already exist.'));
        const confirmed = await confirm('Delete existing certificates and regenerate?');
        if (!confirmed) {
            console.log(chalk.gray('Cancelled'));
            return;
        }

        // Delete existing certs
        const fs = await import('fs');
        if (status.keyPath) fs.unlinkSync(status.keyPath);
        if (status.certPath) fs.unlinkSync(status.certPath);
    }

    const result = generateSSL();

    if (result.success) {
        console.log(chalk.green('\n\u2705 SSL certificates generated successfully!'));
        console.log(chalk.gray(`   Method: ${result.method}`));
        console.log(chalk.gray(`   Key:    ${result.keyPath}`));
        console.log(chalk.gray(`   Cert:   ${result.certPath}`));
        console.log(chalk.cyan('\n\ud83d\udd04 Restart the server to use HTTPS'));
    } else {
        console.log(chalk.red(`\n\u274c ${result.message || result.error}`));
    }
}

/**
 * Show SSL status
 */
function showSSLStatus() {
    const status = getSSLStatus();

    console.log(chalk.cyan.bold('\n\ud83d\udd10 SSL Certificate Status\n'));
    console.log(chalk.gray('='.repeat(40)));

    if (status.exists) {
        console.log(chalk.green('\n\u2705 SSL certificates are available'));
        console.log(chalk.white(`   Key:  ${chalk.gray(status.keyPath)}`));
        console.log(chalk.white(`   Cert: ${chalk.gray(status.certPath)}`));
        console.log(chalk.cyan('\n   HTTPS will be used when server starts'));
    } else {
        console.log(chalk.yellow(`\n\u26a0\ufe0f  ${status.message}`));
        console.log(chalk.gray('\n   Run `luma-cli ssl generate` to create certificates'));
    }

    console.log(chalk.gray('\n' + '='.repeat(40)));
}
