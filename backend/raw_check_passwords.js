require('dotenv').config();
const { User } = require('./src/models');

async function check() {
  try {
    const users = await User.findAll({ limit: 5 });
    users.forEach(u => {
      console.log(`User: ${u.username}, Pwd length: ${u.password?.length}, Starts with: ${u.password?.substring(0, 5)}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
