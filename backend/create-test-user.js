require('dotenv').config();
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const testEmail = 'user@tracova.com';
    const testPassword = 'userpass123';
    
    const existing = await User.findOne({ where: { email: testEmail } });
    if (existing) {
      console.log('✓ Test user already exists');
      process.exit(0);
    }

    const hash = await bcrypt.hash(testPassword, 10);
    const user = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      phone: '+25787654321',
      email: testEmail,
      password: hash,
      country: 'Rwanda',
      currency: 'RWF',
      role: 'user',
      isVerified: true,
      balance: 500000,
      referralCode: 'TESTUSER123'
    });

    console.log('✓ Test user created successfully!');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);
    console.log(`  Balance: 500,000 RWF`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
