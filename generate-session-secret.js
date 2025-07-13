#!/usr/bin/env node

/**
 * Generate a secure session secret for production deployment
 * Run with: node generate-session-secret.js
 */

const crypto = require('crypto');

function generateSessionSecret() {
  // Generate 64 bytes (512 bits) of random data and convert to hex
  const secret = crypto.randomBytes(64).toString('hex');
  return secret;
}

const secret = generateSessionSecret();

console.log('🔐 Generated secure SESSION_SECRET:');
console.log('');
console.log(secret);
console.log('');
console.log('💡 Copy this value to your .env file:');
console.log(`SESSION_SECRET=${secret}`);
console.log('');
console.log('⚠️  Keep this secret secure and never commit it to version control!');
