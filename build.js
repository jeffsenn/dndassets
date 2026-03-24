const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

async function encrypt(password, text) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    
    // Using pbkdf2Sync for the key
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Combine encrypted data and tag into one Buffer, then to Base64
    const fullCiphertext = Buffer.concat([encrypted, tag]).toString('base64');

    const result = {
        iv: iv.toString('base64'),
        salt: salt.toString('base64'),
        ciphertext: fullCiphertext
    };
    return JSON.stringify(result);
}

function getPassword(fn) {
    try {
        return fs.readFileSync(fn, 'utf8').replace(/[\r\n]+/gm, "");
    } catch (err) {
        console.error('Please create a file "passphrase.txt" with your access password');
        process.exit(1);
    }
}

const myPassword = getPassword("./passphrase.txt");
const indexFile = './secretindex.txt';
const sourceDir = './updates';
const targetDir = './images';
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

async function build() {
    const renames = [];
    const indexappends = [];    
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir, { recursive: true });
    if (!fs.existsSync(indexFile)) fs.writeFileSync(indexFile, '');
    try {
        const files = fs.readdirSync(sourceDir);
        
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (imageExtensions.includes(ext)) {
                const randomName = crypto.randomBytes(16).toString('hex') + ext;
                const oldPath = path.join(sourceDir, file);
                const newPath = path.join(targetDir, randomName);
                
                renames.push([oldPath, newPath]);
                
                const logEntry = `<li><a href="images/${randomName}">${file}</a></li>\n`;
                indexappends.push(logEntry);
            }
        }
    } catch (err) {
        console.error('Error processing files:', err.message);
        process.exit(1);
    }
    // Encrypt the accumulated index
    const indexContent = "<ul>\n" + fs.readFileSync(indexFile, 'utf8') + indexappends.join("") + "</ul>";
    const encrypted = await encrypt(myPassword, indexContent);
    fs.writeFileSync("./index.txt", encrypted, 'utf8');
    // Move the files only after encryption succeeds
    fs.appendFileSync(indexFile, indexappends.join(""));
    renames.forEach(([oldPath, newPath]) => {
        fs.renameSync(oldPath, newPath);
        console.log(`Moved: ${path.basename(oldPath)} -> ${path.basename(newPath)}`);
    });
    console.log("Build complete. index.txt updated.");
}

// Execute the async function
build().catch(err => {
    console.error("Build failed:", err);
    process.exit(1);
});

//send it
try {
    execSync('git add -A', { encoding: 'utf8' });
    execSync('git commit -m updates', { encoding: 'utf8' });
    execSync('git push', { encoding: 'utf8' });    
} catch (error) {
    console.error('Git command failed:', error.message);
}

