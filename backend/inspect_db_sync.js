require('dotenv').config();
const { sequelize } = require('./src/models');

async function check() {
  try {
    const [cols] = await sequelize.query("DESCRIBE admins");
    console.log('Admins Columns:', cols.map(c => c.Field));
    
    const [admins] = await sequelize.query("SELECT * FROM admins");
    admins.forEach(a => console.log(`- Admin: ${a.username}, Hash: ${a.password?.substring(0, 10)}...`));
    
    // Check Users too
    const [uCols] = await sequelize.query("DESCRIBE users");
    console.log('Users Columns:', uCols.map(c => c.Field));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
