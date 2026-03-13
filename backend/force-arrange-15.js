require('dotenv').config();
const { Machine, Investment } = require('./src/models');
async function forceClean() {
  const plans = [
    'Tractor X200', 'Plow Deluxe', 'Harvester Pro', 'Mini Cultivator', 'Seeder M1',
    'Miller 250', 'Irrigation Machine', 'Crop Duster', 'Harvest Titan', 'Pro Seeder 900',
    'Mega Agro Combine', 'Deep Well Driller', 'Soil Nutrient Lab', 'Autonomous Crop Rover', 'Silo Storage Unit'
  ];
  
  const allInDb = await Machine.findAll();
  for (const dbM of allInDb) {
    if (!plans.includes(dbM.name)) {
      console.log(`Force deleting extra plan: ${dbM.name}`);
      await Investment.destroy({ where: { machineId: dbM.id } });
      await dbM.destroy();
    }
  }
  
  const finalCount = await Machine.count();
  console.log(`Arrangement complete. Exact plan count in platform: ${finalCount}`);
  process.exit();
}
forceClean();
