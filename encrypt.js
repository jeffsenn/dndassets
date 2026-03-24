const crypto = require('crypto');

async function encrypt(password, text) {
    // 1. Generate random salt (16 bytes) and IV (12 bytes)
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    // 100,000 iterations and SHA-256 to match the browser script
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let ciphertext = cipher.update(text, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    // The Web Crypto API appends the 16-byte tag to the ciphertext automatically
    const tag = cipher.getAuthTag();
    const fullCiphertext = Buffer.concat([
        Buffer.from(ciphertext, 'base64'), 
        tag
    ]).toString('base64');
    const result = {
        iv: iv.toString('base64'),
        salt: salt.toString('base64'),
        ciphertext: fullCiphertext
    };
    console.log("\n--- ENCRYPTED JSON ---");
    console.log(JSON.stringify(result));
    console.log("----------------------\n");
}

// --- USAGE ---
const myPassword = "YourSecurePassword123";
const mySecret = "This is a secret message hidden in the HTML!";

encrypt(myPassword, mySecret);
