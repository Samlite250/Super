const { User } = require('./src/models');

async function checkColumns() {
  try {
    const user = await User.describe();
    console.log('User Table Columns:', Object.keys(user));
    process.exit(0);
  } catch (err) {
    console.error('Error describing table:', err.message);
    process.exit(1);
  }
}

checkColumns();
