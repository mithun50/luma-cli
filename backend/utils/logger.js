/**
 * Structured logging for Luma-CLI
 */

import chalk from 'chalk';

// Log levels
const LEVELS = {
    debug: { priority: 0, color: 'gray', icon: '\ud83d\udd0d' },
    info: { priority: 1, color: 'blue', icon: '\u2139\ufe0f' },
    success: { priority: 2, color: 'green', icon: '\u2705' },
    warn: { priority: 3, color: 'yellow', icon: '\u26a0\ufe0f' },
    error: { priority: 4, color: 'red', icon: '\u274c' },
};

let currentLevel = 'info';

/**
 * Set the current log level
 */
export function setLogLevel(level) {
    if (LEVELS[level]) {
        currentLevel = level;
    }
}

/**
 * Format a log message
 */
function formatMessage(level, message, data = null) {
    const { color, icon } = LEVELS[level];
    const timestamp = new Date().toISOString().substr(11, 8);

    let formatted = `${chalk.gray(timestamp)} ${icon} ${chalk[color](message)}`;

    if (data) {
        if (typeof data === 'object') {
            formatted += '\n' + chalk.gray(JSON.stringify(data, null, 2));
        } else {
            formatted += chalk.gray(` ${data}`);
        }
    }

    return formatted;
}

/**
 * Log at a specific level
 */
function log(level, message, data = null) {
    if (LEVELS[level].priority >= LEVELS[currentLevel].priority) {
        console.log(formatMessage(level, message, data));
    }
}

export const logger = {
    debug: (msg, data) => log('debug', msg, data),
    info: (msg, data) => log('info', msg, data),
    success: (msg, data) => log('success', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),

    // Special formatted outputs
    box: (title, content) => {
        const width = 50;
        const line = '='.repeat(width);
        console.log('\n' + chalk.cyan(line));
        console.log(chalk.cyan.bold(`  ${title}`));
        console.log(chalk.cyan(line));
        if (Array.isArray(content)) {
            content.forEach(line => console.log(`  ${line}`));
        } else {
            console.log(`  ${content}`);
        }
        console.log(chalk.cyan(line) + '\n');
    },

    // Server startup banner
    banner: () => {
        console.log(chalk.cyan.bold(`
 _                           ____ _     ___
| |   _   _ _ __ ___   __ _ / ___| |   |_ _|
| |  | | | | '_ \` _ \\ / _\` | |   | |    | |
| |__| |_| | | | | | | (_| | |___| |___ | |
|_____\\__,_|_| |_| |_|\\__,_|\\____|_____|___|

        Remote Control for Antigravity IDE
`));
    },

    setLevel: setLogLevel,
};

export default logger;
