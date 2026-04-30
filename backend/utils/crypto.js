const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-cbc';

const getKeyBuffer = () => {
  const key = process.env.AES_KEY;
  if (!key || key.length < 32) {
    throw new Error('AES_KEY must be at least 32 characters');
  }
  return Buffer.from(key.slice(0, 32));
};

const encryptFile = (inputPath, outputPath) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getKeyBuffer(), iv);

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => resolve(iv.toString('hex')));
    output.on('error', reject);
    input.on('error', reject);
  });
};

const decryptFileToBuffer = (inputPath, ivHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, getKeyBuffer(), iv);

  return new Promise((resolve, reject) => {
    const chunks = [];
    const input = fs.createReadStream(inputPath);

    input.pipe(decipher)
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject);

    input.on('error', reject);
  });
};

module.exports = { encryptFile, decryptFileToBuffer };
