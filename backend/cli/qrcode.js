/**
 * QR Code Terminal Display
 */

import qrcode from 'qrcode-terminal';
import chalk from 'chalk';

/**
 * Convert HTTP URL to luma:// deep link
 * @param {string} url - HTTP URL (e.g., http://192.168.1.100:3000)
 * @returns {string} Deep link (e.g., luma://192.168.1.100:3000)
 */
export function toDeepLink(url) {
    return url.replace(/^https?:\/\//, 'luma://');
}

/**
 * Display QR code in terminal
 * @param {string} url - URL to encode
 * @param {Object} options - Display options
 * @param {boolean} options.small - Use small QR code
 * @param {boolean} options.deepLink - Generate QR for deep link instead
 */
export function displayQRCode(url, options = {}) {
    const { small = true, deepLink = true } = options;
    const qrUrl = deepLink ? toDeepLink(url) : url;

    console.log('\n' + chalk.cyan('\ud83d\udcf1 Scan this QR Code to connect:'));
    console.log('');
    qrcode.generate(qrUrl, { small }, (qrString) => {
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
    const deepLink = toDeepLink(url);
    const width = 55;
    const line = '='.repeat(width);

    console.log('\n' + chalk.cyan(line));

    if (mode === 'local') {
        console.log(chalk.cyan.bold('   \ud83d\udce1 LOCAL WIFI ACCESS'));
    } else {
        console.log(chalk.cyan.bold('   \ud83c\udf0d GLOBAL WEB ACCESS'));
    }

    console.log(chalk.cyan(line));
    console.log(chalk.white(`   \ud83d\udd17 URL:       ${chalk.green.bold(url)}`));
    console.log(chalk.white(`   \ud83d\udcf1 Deep Link: ${chalk.magenta.bold(deepLink)}`));

    if (mode === 'local' && localAuth) {
        console.log(chalk.white('   \ud83d\udd11 Passcode:  ') + chalk.gray('Not required for local WiFi'));
    } else if (passcode) {
        console.log(chalk.white(`   \ud83d\udd11 Passcode:  ${chalk.yellow.bold(passcode)}`));
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
        console.log(chalk.gray('   2. Scan the QR code with Luma app or Camera'));
        console.log(chalk.gray('   3. The app will auto-connect using the deep link'));
        console.log(chalk.gray('   \u2728 Or tap the luma:// link to open directly!'));
    } else {
        console.log(chalk.gray('   1. Switch your phone to Mobile Data or any network'));
        console.log(chalk.gray('   2. Scan the QR code with Luma app or Camera'));
        console.log(chalk.gray('   3. The app will auto-connect using the deep link'));
        console.log(chalk.gray('   4. Or visit the URL and enter the passcode'));
    }

    console.log(chalk.gray('-'.repeat(50)));
}
