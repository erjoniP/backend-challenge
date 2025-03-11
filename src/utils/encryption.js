const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

/**
 * Validate encryption secret presence
 * This is a critical security check that runs when the module is loaded
 * Prevents the application from starting without proper encryption configuration
 */
if (!process.env.ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
}

// Initialize encryption key using environment secret
// Uses scrypt for key derivation with a static salt
const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32);
const iv = Buffer.alloc(16, 0); // Initialization vector

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
