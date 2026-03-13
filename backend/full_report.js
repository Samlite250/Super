require('dotenv').config();
const { Machine } = require('./src/models');

async function check() {
  const machines = await Machine.findAll({ order: [['priceFBu', 'ASC']] });
  console.log('--- MACHINE IMAGE REPORT ---');
  machines.forEach((m, idx) => {
    console.log(`[#${idx+1}] ID: ${m.id} | Name: ${m.name}`);
    console.log(`      Price: ${m.priceFBu} | Image: ${m.imageUrl || 'NULL'}`);
  });
  process.exit();
}
check();
