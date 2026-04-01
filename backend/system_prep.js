const { sequelize, Setting, User, Machine } = require('./src/models');
const bcrypt = require('bcryptjs');

async function setup() {
  try {
    console.log('🔄 Starting System Integrity Check...');
    
    // 1. Sync Database
    await sequelize.sync({ alter: true });
    console.log('✅ Database Schema Synchronized.');

    // 2. Ensure Essential Settings Exist
    const essentialSettings = [
      { id: 'referral_reward_percentage', value: '10', description: 'Instant commission % for all referrals' },
      { id: 'referral_high_capital_threshold', value: '500000', description: 'Threshold for high-capital commission' },
      { id: 'referral_high_capital_bonus', value: '5', description: 'Extra % for high-capital referrals' },
      { id: 'signup_bonus_Burundi', value: '2500', description: 'Welcome bonus for Burundi' },
      { id: 'signup_bonus_Global', value: '0', description: 'Welcome bonus for Global' },
      { id: 'withdrawal_fee_percent', value: '2', description: 'Fee % for withdrawals' },
      { id: 'system_email', value: 'admin@tracova.com', description: 'Official system communication email' }
    ];

    for (const s of essentialSettings) {
      await Setting.findOrCreate({
        where: { id: s.id },
        defaults: s
      });
    }
    console.log('✅ Essential Settings Pulse Verified.');

    // 3. Check Admin Account
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      const hash = await bcrypt.hash('Admin@2026!', 10);
      await User.create({
        fullName: 'System Administrator',
        username: 'admin',
        email: 'admin@tracova.com',
        phone: '+25700000000',
        password: hash,
        role: 'admin',
        isVerified: true,
        referralCode: 'ADMIN',
        country: 'Global'
      });
      console.log('✅ Default Admin Account Created (admin / Admin@2026!)');
    } else {
      console.log(`✅ Admin Account exists: ${admin.username}`);
      // Ensure it has a password if it was corrupted
      if (!admin.password) {
        admin.password = await bcrypt.hash('Admin@2026!', 10);
        await admin.save();
        console.log('⚠️ Restored missing admin password.');
      }
    }

    console.log('🚀 System ready for clients.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

setup();
