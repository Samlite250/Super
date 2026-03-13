require('dotenv').config();
const { Machine, Investment } = require('./src/models');
async function check() {
  const m = await Machine.findOne({ where: { name: 'Harvestor26' } });
  if (m) {
    const counts = await Investment.count({ where: { machineId: m.id } });
    console.log(`Machine ${m.name} has ${counts} investments.`);
  }
}
check();
