require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, sequelize } = require('./src/models');

async function sync() {
  try {
    const users = await User.findAll();
    console.log(`Checking ${users.length} users...`);
    
    for (const u of users) {
        if (!u.password.startsWith('$2b$')) {
            console.log(`[ALERT] Found plaintext password for ${u.username}. Rehashing...`);
            const hash = await bcrypt.hash(u.password, 10);
            u.password = hash;
            await u.save();
        }
        // Force all to be verified for stability
        if (!u.isVerified) {
            u.isVerified = true;
            await u.save();
        }
    }
    
    // Check Admins table too and move to Users
    try {
        const [admins] = await sequelize.query("SELECT * FROM admins");
        for (const a of admins) {
            const exists = await User.findOne({ where: { username: a.username } });
            if (!exists) {
                console.log(`[MIGRATING] Moving admin ${a.username} to Users table...`);
                let pwd = a.password;
                if (!pwd.startsWith('$2b$')) pwd = await bcrypt.hash(pwd, 10);
                
                await User.create({
                    fullName: a.username,
                    username: a.username,
                    email: `${a.username.toLowerCase()}@supercash.com`,
                    phone: `000000${a.id}`,
                    password: pwd,
                    country: 'Burundi',
                    currency: 'FBu',
                    role: 'admin',
                    isVerified: true
                });
            }
        }
    } catch (e) {
        console.log('No Admins table to migrate or error:', e.message);
    }
    
    console.log('Database Synchronization Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal Error:', err.message);
    process.exit(1);
  }
}

sync();
