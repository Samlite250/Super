require('dotenv').config();
const { Machine } = require('./src/models');

async function check() {
  const machines = await Machine.findAll({ order: [['priceFBu', 'ASC']] });
  machines.forEach((m, idx) => {
    console.log(`Pos: ${idx + 1}, ID: ${m.id}, Name: ${m.name}, Image: ${m.imageUrl}`);
  });
  process.exit();
}
check();
