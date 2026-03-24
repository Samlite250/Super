require('dotenv').config();
const { sequelize } = require('./src/models');

async function check() {
  try {
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('Tables:', results.map(r => Object.values(r)[0]));
    
    // Check if Admins table exists
    const tables = results.map(r => Object.values(r)[0].toLowerCase());
    if (tables.includes('admins')) {
       const [admins] = await sequelize.query("SELECT * FROM Admins");
       console.log('Admins count:', admins.length);
       for (const a of admins) {
         console.log(`- Admin: ${a.username} (${a.email})`);
       }
    } else {
       console.log('No Admins table found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
