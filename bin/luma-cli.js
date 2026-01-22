#!/usr/bin/env node
/**
 * Luma-CLI - Remote monitoring and control for Antigravity IDE
 * Main CLI entry point
 */

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const pkgPath = join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Import command handlers
import { startCommand } from '../backend/cli/commands/start.js';
import { configCommand } from '../backend/cli/commands/config.js';
import { sslCommand } from '../backend/cli/commands/ssl.js';
import { infoCommand } from '../backend/cli/commands/info.js';

program
    .name('luma-cli')
    .description('Remote monitoring and control for Antigravity IDE')
    .version(pkg.version);

// Start command
program
    .command('start')
    .description('Start the Luma server')
    .option('-l, --local', 'Start in local/LAN mode (default)')
    .option('-w, --web', 'Start in web/ngrok tunnel mode')
    .option('-p, --port <port>', 'Server port', '3000')
    .option('-a, --auto-launch', 'Auto-launch Antigravity IDE with debug mode')
    .option('-d, --directory <dir>', 'Directory to open in Antigravity (default: .)', '.')
    .action(startCommand);

// Config command
program
    .command('config')
    .description('Manage configuration')
    .argument('[action]', 'Action: show, set, reset')
    .argument('[key]', 'Config key (for set)')
    .argument('[value]', 'Config value (for set)')
    .action(configCommand);

// SSL command
program
    .command('ssl')
    .description('SSL certificate management')
    .argument('[action]', 'Action: generate, status')
    .action(sslCommand);

// Info command
program
    .command('info')
    .description('Show connection info and QR codes')
    .action(infoCommand);

// Parse arguments
program.parse();
