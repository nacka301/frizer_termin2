#!/usr/bin/env node

/**
 * Coolify Environment Generator
 * Generates all environment variables needed for salon deployment
 */

const crypto = require('crypto');

console.log('🔐 Generating Coolify Environment Variables for Salons\n');

const salons = [
  { id: 'marko', name: 'Frizerski salon Marko', email: 'marko@salon-marko.com' },
  { id: 'ana', name: 'Beauty Salon Ana', email: 'ana@beauty-salon-ana.com' },
  { id: 'petra', name: 'Unisex Salon Petra', email: 'petra@salon-petra.com' }
];

function generateSessionSecret() {
  return crypto.randomBytes(64).toString('hex');
}

console.log('📋 Copy these environment variables to each Coolify application:\n');

salons.forEach((salon, index) => {
  console.log(`🏪 === SALON ${salon.id.toUpperCase()} ===`);
  console.log(`Coolify App Name: salon-${salon.id}`);
  console.log(`Domain: salon-${salon.id}.yourdomain.com\n`);
  
  console.log('Environment Variables:');
  console.log(`NODE_ENV=production`);
  console.log(`SALON_ID=${salon.id}`);
  console.log(`PORT=3000`);
  console.log(`DATABASE_URL=postgresql://frizerke_user:YOUR_DB_PASSWORD@salon-postgres:5432/salon_${salon.id}_db`);
  console.log(`SESSION_SECRET=${generateSessionSecret()}`);
  console.log(`EMAIL_USER=notifications@yourdomain.com`);
  console.log(`EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD`);
  console.log(`ADMIN_EMAIL=${salon.email}`);
  console.log(`HTTPS_ONLY=true`);
  
  if (index < salons.length - 1) {
    console.log('\n' + '='.repeat(50) + '\n');
  }
});

console.log('\n🎯 NEXT STEPS:');
console.log('1. Replace YOUR_DB_PASSWORD with your PostgreSQL password');
console.log('2. Replace yourdomain.com with your actual domain');
console.log('3. Replace YOUR_GMAIL_APP_PASSWORD with Gmail app password');
console.log('4. Copy each section to respective Coolify application');

console.log('\n🚀 After setup, your salons will be available at:');
salons.forEach(salon => {
  console.log(`   ✅ https://salon-${salon.id}.yourdomain.com`);
});

console.log('\n💰 Ready for business! Each salon can be charged €25/month');
console.log('📊 Your cost: ~€10/month total for all salons');
