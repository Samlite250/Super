require('dotenv').config();
const { User } = require('./src/models');

async function check() {
  try {
    const users = await User.findAll();
    users.forEach(u => {
      console.log(`- User: ${u.username}, Pwd: ${u.password.substring(0, 10)}... BCrypt: ${u.password.startsWith('$2b$')}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
