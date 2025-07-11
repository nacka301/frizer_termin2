const bcrypt = require('bcrypt');

async function testHash() {
    // Generate new hash
    const newHash = await bcrypt.hash('password123', 10);
    console.log('Generated hash:', newHash);
    
    // Test the hash
    const isValid = await bcrypt.compare('password123', newHash);
    console.log('Hash is valid:', isValid);
}

testHash().catch(console.error);
