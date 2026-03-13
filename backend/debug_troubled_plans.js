require('dotenv').config();
const { Machine, Investment } = require('./src/models');

async function debugPlans() {
  const ids = [8, 14, 15];
  console.log('--- DEBUGGING PLANS 8, 14, 15 ---');
  for (const id of ids) {
    const m = await Machine.findByPk(id);
    if (!m) {
      console.log(`ID ${id}: NOT FOUND`);
      continue;
    }
    const invCount = await Investment.count({ where: { machineId: id } });
    console.log(`ID: ${m.id}, Name: ${m.name}, Price: ${m.priceFBu}, Daily%: ${m.dailyPercent}, Duration: ${m.durationDays}, Investments: ${invCount}`);
  }
  process.exit();
}
debugPlans();
