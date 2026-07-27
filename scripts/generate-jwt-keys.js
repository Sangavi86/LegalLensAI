/**
 * One-time helper script to generate RS256 RSA key pair for JWT signing/verification.
 * Output is formatted to be directly copied into apps/api/.env
 */
const { generateKeyPairSync } = require('crypto');

console.log('🔑 Generating RSA 2048-bit key pair for RS256 JWT...\n');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const formattedPrivate = JSON.stringify(privateKey);
const formattedPublic = JSON.stringify(publicKey);

console.log('Copy the following lines into your apps/api/.env file:\n');
console.log(`JWT_PRIVATE_KEY=${formattedPrivate}`);
console.log('\n');
console.log(`JWT_PUBLIC_KEY=${formattedPublic}`);
console.log('\n✅ RSA Keys generated successfully.');
