/**
 * QR Code Terminal Display
 */

import qrcode from 'qrcode-terminal';
import chalk from 'chalk';

/**
 * Display QR code in terminal
 * @param {string} url - URL to encode
 * @param {Object} options - Display options
 * @param {boolean} options.small - Use small QR code
 */
export function displayQRCode(url, options = {}) {
    const { small = true } = options;

    console.log('\n' + chalk.cyan('\ud83d\udcf1 Scan this QR Code to connect:'));
    console.log('');
    qrcode.generate(url, { small }, (qrString) => {
        console.log(qrString);
    });
}

/**
 * Display connection info box
 * @param {Object} info - Connection info
 * @param {string} info.mode - Connection mode (local/web)
 * @param {string} info.url - Connection URL
 * @param {string} info.passcode - Passcode (if applicable)
 * @param {boolean} info.localAuth - Whether local auth is bypassed
 */
export function displayConnectionInfo(info) {
    const { mode, url, passcode, localAuth = true } = info;
    const width = 55;
    const line = '='.repeat(width);

    console.log('\n' + chalk.cyan(line));

    if (mode === 'local') {
        console.log(chalk.cyan.bold('   \ud83d\udce1 LOCAL WIFI ACCESS'));
    } else {
        console.log(chalk.cyan.bold('   \ud83c\udf0d GLOBAL WEB ACCESS'));
    }

    console.log(chalk.cyan(line));
    console.log(chalk.white(`   \ud83d\udd17 URL: ${chalk.green.bold(url)}`));

    if (mode === 'local' && localAuth) {
        console.log(chalk.white('   \ud83d\udd11 Passcode: ') + chalk.gray('Not required for local WiFi'));
    } else if (passcode) {
        console.log(chalk.white(`   \ud83d\udd11 Passcode: ${chalk.yellow.bold(passcode)}`));
    }

    console.log(chalk.cyan(line));
}

/**
 * Display connection steps
 * @param {string} mode - Connection mode (local/web)
 */
export function displayConnectionSteps(mode) {
    console.log('\n' + chalk.gray('-'.repeat(50)));
    console.log(chalk.white.bold('   \ud83d\udcdd Steps to Connect:'));

    if (mode === 'local') {
        console.log(chalk.gray('   1. Ensure your phone is on the SAME Wi-Fi network'));
        console.log(chalk.gray('   2. Open your phone\'s Camera app or a QR scanner'));
        console.log(chalk.gray('   3. Scan the code above OR manually type the URL'));
        console.log(chalk.gray('   4. You should be connected automatically!'));
    } else {
        console.log(chalk.gray('   1. Switch your phone to Mobile Data or any network'));
        console.log(chalk.gray('   2. Open your phone\'s Camera app or a QR scanner'));
        console.log(chalk.gray('   3. Scan the code above to auto-login'));
        console.log(chalk.gray('   4. Or visit the URL and enter the passcode'));
    }

    console.log(chalk.gray('-'.repeat(50)));
}
