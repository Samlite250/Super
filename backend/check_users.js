require('dotenv').config();
const { User } = require('./src/models');

async function check() {
  try {
    const users = await User.findAll();
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`- ${u.username} (${u.email})`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
