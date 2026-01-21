/**
 * Config Command - Configuration management
 */

import chalk from 'chalk';
import fs from 'fs';
import { join } from 'path';
import { PROJECT_ROOT, getAllConfig } from '../../config/index.js';
import { promptConfigValue, confirm } from '../prompts.js';

const envPath = join(PROJECT_ROOT, '.env');

/**
 * Read .env file as object
 */
function readEnvFile() {
    if (!fs.existsSync(envPath)) {
        return {};
    }
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    return env;
}

/**
 * Write object to .env file
 */
function writeEnvFile(env) {
    const content = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    fs.writeFileSync(envPath, content + '\n');
}

/**
 * Config command handler
 * @param {string} action - Action (show, set, reset)
 * @param {string} key - Config key
 * @param {string} value - Config value
 */
export async function configCommand(action, key, value) {
    // Default to show if no action
    if (!action) {
        action = 'show';
    }

    switch (action) {
        case 'show':
            showConfig();
            break;

        case 'set':
            if (!key || !value) {
                // Interactive mode
                const result = await promptConfigValue();
                await setConfig(result.key, result.value);
            } else {
                await setConfig(key, value);
            }
            break;

        case 'reset':
            await resetConfig();
            break;

        default:
            console.log(chalk.red(`Unknown action: ${action}`));
            console.log(chalk.gray('Available actions: show, set, reset'));
    }
}

/**
 * Show current configuration
 */
function showConfig() {
    const config = getAllConfig();
    const env = readEnvFile();

    console.log(chalk.cyan.bold('\n\ud83d\udd27 Current Configuration\n'));
    console.log(chalk.gray('='.repeat(40)));

    console.log(chalk.white('\nServer:'));
    console.log(`  Port:     ${chalk.green(config.server.port)}`);
    console.log(`  Password: ${chalk.yellow(config.server.password === 'antigravity' ? '(default)' : '***')}`);

    console.log(chalk.white('\nSSL:'));
    console.log(`  Enabled:  ${config.ssl.hasSSL ? chalk.green('Yes') : chalk.gray('No')}`);
    if (config.ssl.hasSSL) {
        console.log(`  Key:      ${chalk.gray(config.ssl.keyPath)}`);
        console.log(`  Cert:     ${chalk.gray(config.ssl.certPath)}`);
    }

    console.log(chalk.white('\nNgrok:'));
    console.log(`  Token:    ${config.ngrok.authToken ? chalk.green('Configured') : chalk.yellow('Not set')}`);

    console.log(chalk.gray('\n' + '='.repeat(40)));
    console.log(chalk.gray(`\nConfig file: ${envPath}`));
}

/**
 * Set configuration value
 */
async function setConfig(key, value) {
    const env = readEnvFile();
    const keyMap = {
        'password': 'APP_PASSWORD',
        'ngrok-token': 'NGROK_AUTHTOKEN',
        'port': 'PORT'
    };

    const envKey = keyMap[key] || key.toUpperCase();

    env[envKey] = value;
    writeEnvFile(env);

    console.log(chalk.green(`\u2705 Set ${key} = ${key.includes('password') || key.includes('token') ? '***' : value}`));
}

/**
 * Reset configuration
 */
async function resetConfig() {
    const confirmed = await confirm('Reset all configuration to defaults?');
    if (confirmed) {
        if (fs.existsSync(envPath)) {
            fs.unlinkSync(envPath);
        }
        console.log(chalk.green('\u2705 Configuration reset to defaults'));
    } else {
        console.log(chalk.gray('Cancelled'));
    }
}
