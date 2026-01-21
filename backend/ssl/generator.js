/**
 * SSL Certificate Generator
 */

import { execSync } from 'child_process';
import { generateKeyPairSync, createSign } from 'crypto';
import fs from 'fs';
import { join } from 'path';
import { getOpenSSLPath } from './openssl.js';
import { getAllLocalIPs } from '../utils/network.js';
import { PROJECT_ROOT } from '../config/index.js';
import { DEFAULTS } from '../config/defaults.js';

const certsDir = join(PROJECT_ROOT, DEFAULTS.CERTS_DIR);
const keyPath = join(certsDir, DEFAULTS.KEY_FILE);
const certPath = join(certsDir, DEFAULTS.CERT_FILE);

/**
 * Generate certificate using OpenSSL (preferred - has proper SAN support)
 * @param {string[]} ips - IP addresses for SAN
 * @param {string} opensslPath - Path to OpenSSL executable
 */
function generateWithOpenSSL(ips, opensslPath) {
    console.log('\ud83d\udd27 Using OpenSSL for certificate generation...');
    console.log(`   Path: ${opensslPath}\n`);

    // Build SAN extension with IP addresses
    const sanEntries = ['DNS:localhost', ...ips.map(ip => `IP:${ip}`)];
    const sanString = sanEntries.join(',');

    // Create OpenSSL config file for SAN support
    const configPath = join(certsDir, 'openssl.cnf');
    const config = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = US
O = LumaCLI
CN = localhost

[v3_req]
subjectAltName = ${sanString}
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
`;

    fs.writeFileSync(configPath, config);

    try {
        // Generate certificate with OpenSSL (quote path for spaces)
        const opensslCmd = opensslPath.includes(' ') ? `"${opensslPath}"` : opensslPath;
        const cmd = `${opensslCmd} req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -config "${configPath}"`;
        execSync(cmd, { stdio: 'pipe' });

        // Clean up config file
        fs.unlinkSync(configPath);

        return true;
    } catch (e) {
        // Clean up on failure
        if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
        throw e;
    }
}

/**
 * Generate certificate using Node.js crypto (fallback - no SAN support)
 */
function generateWithNodeCrypto() {
    console.log('\ud83d\udd27 Using Node.js crypto for certificate generation...');
    console.log('   (OpenSSL not found - certificate will show URL mismatch warning)\n');

    // Generate RSA key pair
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // ASN.1 helper functions
    function encodeLength(len) {
        if (len < 128) return Buffer.from([len]);
        const bytes = [];
        let temp = len;
        while (temp > 0) {
            bytes.unshift(temp & 0xff);
            temp >>= 8;
        }
        return Buffer.from([0x80 | bytes.length, ...bytes]);
    }

    function asn1Sequence(...items) {
        const content = Buffer.concat(items);
        return Buffer.concat([Buffer.from([0x30]), encodeLength(content.length), content]);
    }

    function asn1Set(...items) {
        const content = Buffer.concat(items);
        return Buffer.concat([Buffer.from([0x31]), encodeLength(content.length), content]);
    }

    function asn1OID(oid) {
        const parts = oid.split('.').map(Number);
        const bytes = [parts[0] * 40 + parts[1]];
        for (let i = 2; i < parts.length; i++) {
            let val = parts[i];
            if (val === 0) {
                bytes.push(0);
            } else {
                const encoded = [];
                while (val > 0) {
                    encoded.unshift((val & 0x7f) | (encoded.length ? 0x80 : 0));
                    val >>= 7;
                }
                bytes.push(...encoded);
            }
        }
        return Buffer.concat([Buffer.from([0x06, bytes.length]), Buffer.from(bytes)]);
    }

    function asn1UTF8String(str) {
        const buf = Buffer.from(str, 'utf8');
        return Buffer.concat([Buffer.from([0x0c]), encodeLength(buf.length), buf]);
    }

    function asn1PrintableString(str) {
        const buf = Buffer.from(str, 'ascii');
        return Buffer.concat([Buffer.from([0x13]), encodeLength(buf.length), buf]);
    }

    function asn1Integer(num) {
        if (typeof num === 'number') {
            const bytes = [];
            let temp = num;
            do {
                bytes.unshift(temp & 0xff);
                temp >>= 8;
            } while (temp > 0);
            if (bytes[0] & 0x80) bytes.unshift(0);
            return Buffer.concat([Buffer.from([0x02, bytes.length]), Buffer.from(bytes)]);
        }
        let buf = Buffer.isBuffer(num) ? num : Buffer.from(num.toString(16), 'hex');
        if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0]), buf]);
        return Buffer.concat([Buffer.from([0x02]), encodeLength(buf.length), buf]);
    }

    function asn1BitString(data) {
        const content = Buffer.concat([Buffer.from([0]), data]);
        return Buffer.concat([Buffer.from([0x03]), encodeLength(content.length), content]);
    }

    function asn1UTCTime(date) {
        const str = date.toISOString().replace(/[-:T]/g, '').slice(2, 14) + 'Z';
        return Buffer.concat([Buffer.from([0x17, str.length]), Buffer.from(str)]);
    }

    // Create certificate
    const now = new Date();
    const notBefore = now;
    const notAfter = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const serialNumber = Buffer.from(Array.from({ length: 8 }, () => Math.floor(Math.random() * 256)));

    const commonName = asn1Sequence(asn1OID('2.5.4.3'), asn1UTF8String('localhost'));
    const orgName = asn1Sequence(asn1OID('2.5.4.10'), asn1UTF8String('LumaCLI'));
    const countryName = asn1Sequence(asn1OID('2.5.4.6'), asn1PrintableString('US'));

    const name = asn1Sequence(
        asn1Set(countryName),
        asn1Set(orgName),
        asn1Set(commonName)
    );

    const sha256WithRSA = asn1Sequence(asn1OID('1.2.840.113549.1.1.11'), Buffer.from([0x05, 0x00]));
    const pubKeyBase64 = publicKey.replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
    const pubKeyDer = Buffer.from(pubKeyBase64, 'base64');
    const validity = asn1Sequence(asn1UTCTime(notBefore), asn1UTCTime(notAfter));

    const tbsCertificate = asn1Sequence(
        Buffer.concat([Buffer.from([0xa0, 0x03]), asn1Integer(2)]),
        asn1Integer(serialNumber),
        sha256WithRSA,
        name,
        validity,
        name,
        pubKeyDer
    );

    const sign = createSign('SHA256');
    sign.update(tbsCertificate);
    const signature = sign.sign(privateKey);

    const certificate = asn1Sequence(
        tbsCertificate,
        sha256WithRSA,
        asn1BitString(signature)
    );

    const certPem = '-----BEGIN CERTIFICATE-----\n' +
        certificate.toString('base64').match(/.{1,64}/g).join('\n') +
        '\n-----END CERTIFICATE-----\n';

    fs.writeFileSync(keyPath, privateKey);
    fs.writeFileSync(certPath, certPem);

    return true;
}

/**
 * Generate SSL certificates
 * @returns {Object} Result object with success status and details
 */
export function generateSSL() {
    // Create certs directory if it doesn't exist
    if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
    }

    // Check if certs already exist
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
            success: false,
            message: 'SSL certificates already exist. Delete them and run again to regenerate.',
            keyPath,
            certPath
        };
    }

    console.log('\ud83d\udd10 Generating self-signed SSL certificate...\n');

    const ips = getAllLocalIPs();
    console.log(`\ud83d\udccd Detected IP addresses: ${ips.join(', ')}\n`);

    let method = 'unknown';
    const opensslPath = getOpenSSLPath();

    try {
        if (opensslPath) {
            generateWithOpenSSL(ips, opensslPath);
            method = 'OpenSSL';
        } else {
            generateWithNodeCrypto();
            method = 'Node.js crypto';
        }

        console.log('\u2705 SSL certificates generated successfully!');
        console.log(`   Method: ${method}`);
        console.log(`   Key:    ${keyPath}`);
        console.log(`   Cert:   ${certPath}`);

        if (method === 'OpenSSL') {
            console.log(`   SANs:   localhost, ${ips.join(', ')}`);
        }

        console.log('\n\ud83d\udcf1 When you first visit the HTTPS URL on your phone:');
        console.log('   1. You will see a security warning (normal for self-signed certs)');
        console.log('   2. Tap "Advanced" or "Show Details"');
        console.log('   3. Tap "Proceed to site" or "Visit this website"');
        console.log('   4. The warning will not appear again for this certificate');

        return {
            success: true,
            method,
            keyPath,
            certPath,
            ips
        };
    } catch (e) {
        console.error('\u274c Failed to generate certificate:', e.message);
        return {
            success: false,
            error: e.message
        };
    }
}

/**
 * Check SSL certificate status
 * @returns {Object} SSL status object
 */
export function getSSLStatus() {
    const hasKey = fs.existsSync(keyPath);
    const hasCert = fs.existsSync(certPath);
    const hasBoth = hasKey && hasCert;

    return {
        exists: hasBoth,
        keyPath: hasKey ? keyPath : null,
        certPath: hasCert ? certPath : null,
        message: hasBoth ? 'SSL certificates are available' :
            !hasKey && !hasCert ? 'No SSL certificates found' :
                hasKey ? 'Certificate file missing' : 'Key file missing'
    };
}
