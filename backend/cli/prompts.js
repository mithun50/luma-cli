/**
 * Interactive CLI Prompts
 */

import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Prompt for connection mode
 * @returns {Promise<string>} Selected mode ('local' or 'web')
 */
export async function promptMode() {
    const { mode } = await inquirer.prompt([
        {
            type: 'list',
            name: 'mode',
            message: 'Select connection mode:',
            choices: [
                {
                    name: `${chalk.green('\ud83d\udce1 Local (WiFi)')} - Same network access, no passcode needed`,
                    value: 'local'
                },
                {
                    name: `${chalk.blue('\ud83c\udf0d Web (ngrok)')} - Internet access, requires ngrok token`,
                    value: 'web'
                }
            ]
        }
    ]);
    return mode;
}

/**
 * Prompt for server port
 * @param {number} defaultPort - Default port value
 * @returns {Promise<number>} Selected port
 */
export async function promptPort(defaultPort = 3000) {
    const { port } = await inquirer.prompt([
        {
            type: 'number',
            name: 'port',
            message: 'Server port:',
            default: defaultPort,
            validate: (value) => {
                if (value >= 1 && value <= 65535) return true;
                return 'Please enter a valid port number (1-65535)';
            }
        }
    ]);
    return port;
}

/**
 * Prompt for password
 * @param {string} defaultPassword - Default password
 * @returns {Promise<string>} Entered password
 */
export async function promptPassword(defaultPassword = '') {
    const { password } = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'App password:',
            default: defaultPassword,
            mask: '*'
        }
    ]);
    return password;
}

/**
 * Prompt for ngrok token
 * @returns {Promise<string>} Ngrok token
 */
export async function promptNgrokToken() {
    const { token } = await inquirer.prompt([
        {
            type: 'password',
            name: 'token',
            message: 'Ngrok auth token (get from dashboard.ngrok.com):',
            mask: '*'
        }
    ]);
    return token;
}

/**
 * Confirm action
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} User confirmation
 */
export async function confirm(message) {
    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message,
            default: false
        }
    ]);
    return confirmed;
}

/**
 * Prompt for config key-value
 * @returns {Promise<Object>} Config key and value
 */
export async function promptConfigValue() {
    const { key, value } = await inquirer.prompt([
        {
            type: 'list',
            name: 'key',
            message: 'Select configuration to set:',
            choices: [
                { name: 'Password', value: 'password' },
                { name: 'Ngrok Token', value: 'ngrok-token' },
                { name: 'Port', value: 'port' }
            ]
        },
        {
            type: 'input',
            name: 'value',
            message: 'Enter value:'
        }
    ]);
    return { key, value };
}
