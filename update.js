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

function getFileChecksum(filePath, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
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
const sourceDir = './sources';
const targetDir = './images';

async function build() {
    async function addFiles(sourceDir, copies, idx, open="") {
        const files = fs.readdirSync(sourceDir, { withFileTypes: true });
        if(files.length) {
            for (const file of files) {
                const fullPath = path.join(sourceDir, file.name);
                if (file.isDirectory()) {
                    idx.push("<details "+open+"><summary >"+file.name+"</summary><ul>");
                    await addFiles(fullPath, copies, idx);
                    idx.push("</ul></details>");
                } else {
                    const hashName = await getFileChecksum(fullPath)+path.extname(file.name);
                    idx.push(`<li><a href="images/${hashName}">${file.name}</a></li>`);
                    copies.push([fullPath, path.join(targetDir, hashName)]);
                }
            }
        }
    }
    const copies = [];
    const indexappends = ['<details open><ul>'];    
    if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir, { recursive: true });
    if (!fs.existsSync(indexFile)) fs.writeFileSync(indexFile, '');
    try {
        await addFiles(sourceDir, copies, indexappends, "open");
        indexappends.push('</ul></details>');    
    } catch (err) {
        console.error('Error processing files:', err.message);
        process.exit(1);
    }
    // Encrypt the accumulated index
    const indexContent = indexappends.join("");
    const encrypted = await encrypt(myPassword, indexContent);
    fs.writeFileSync("./index.txt", encrypted, 'utf8');
    // Move the files only after encryption succeeds
    await fs.rmSync(targetDir, { recursive: true, force: true });
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(indexFile, indexappends.join("\n"));
    copies.forEach(([oldPath, newPath]) => {
        fs.copyFileSync(oldPath, newPath);
        console.log(`Copied: ${path.basename(oldPath)} -> ${path.basename(newPath)}`);
    });
    console.log("Build complete. index.txt updated.");
}

// Execute the async function
build().catch(err => {
    console.error("Build failed:", err);
    process.exit(1);
}).then(() => {
    //send it
    console.log("Commmit and Push...");
    try {
        execSync('git add -A', { encoding: 'utf8' });
        execSync('git commit -m updates', { encoding: 'utf8' });
        execSync('git push', { encoding: 'utf8' });    
    } catch (error) {
        console.error('Git command failed:', error.message);
    }
    console.log("Completed.");
});
