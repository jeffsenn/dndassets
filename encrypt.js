const fs = require('fs');
const path = require('path');
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
    return JSON.stringify(result);
}

//this file should NOT be committed to repo
try {
    const myPassword = fs.readFileSync("passphrase.txt", 'utf8');
} catch (err) {
    console.error('Please create a file "passphrase.txt" with your access password');
    process.exit(1);
}
//this file should NOT be committed to repo
const indexFile = './secretindex.txt';

const sourceDir = './updates';
const targetDir = './images';
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
function build() {
    //move all updates to renamed image files (update index as you go)
    if (!fs.existsSync(indexFile)) {
        fs.writeFileSync(indexFile, '');
    }
    try {
        const files = fs.readdirSync(sourceDir);
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (imageExtensions.includes(ext)) {
                const randomName = crypto.randomBytes(16).toString('hex') + ext;
                const oldPath = path.join(sourceDir, file);
                const newPath = path.join(targetDir, randomName);
                fs.renameSync(oldPath, newPath);
                const logEntry = `<li> <a href="images/${randomName}"> ${file} </a></li>\n`;
                fs.appendFileSync(indexFile, logEntry);
            }
        });
    } catch (err) {
        console.error('Error processing files:', err.message);
        process.exit(1);
    }
    //complete the index by encrypting
    const index = "<ul>"+ fs.readFileSync(indexFile, 'utf8') + "</ul>";
    const encrypted = encrypt(myPassword, index);
    await fs.writeFile("./index.txt", encrypted, 'utf8');
}
