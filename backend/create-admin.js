require('dotenv').config();
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const adminEmail = 'admin@supercash.com';
    const adminPassword = 'adminpass123';
    
    const existing = await User.findOne({ where: { email: adminEmail } });
    if (existing) {
      console.log('✓ Admin user already exists');
      process.exit(0);
    }

    const hash = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      fullName: 'Admin User',
      username: 'admin',
      phone: '+25712345678',
      email: adminEmail,
      password: hash,
      country: 'Burundi',
      currency: 'FBu',
      role: 'admin',
      isVerified: true,
      referralCode: 'ADMIN001'
    });

    console.log('✓ Admin user created successfully!');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
