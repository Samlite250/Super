require('dotenv').config();
const { Setting } = require('./src/models');

async function check() {
  try {
    const settings = await Setting.findAll();
    console.log('Total Settings:', settings.length);
    settings.forEach(s => console.log(`- ${s.key}: ${s.value}`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
