require('dotenv').config();
const { Machine, Investment } = require('./src/models');

async function arrange() {
  const plans = [
    { name: 'Tractor X200', priceFBu: 50000, durationDays: 30, dailyPercent: 3, description: 'Basic tractor', imageUrl: '', premium: false },
    { name: 'Plow Deluxe', priceFBu: 100000, durationDays: 30, dailyPercent: 3.2, description: 'Advanced plow', imageUrl: '', premium: false },
    { name: 'Harvester Pro', priceFBu: 150000, durationDays: 30, dailyPercent: 3.5, description: 'Efficient harvester', imageUrl: '', premium: false },
    { name: 'Mini Cultivator', priceFBu: 60000, durationDays: 30, dailyPercent: 3.1, description: 'Small scale cultivator', imageUrl: '', premium: false },
    { name: 'Seeder M1', priceFBu: 200000, durationDays: 30, dailyPercent: 3.6, description: 'High precision seeder', imageUrl: '', premium: false },
    { name: 'Miller 250', priceFBu: 250000, durationDays: 30, dailyPercent: 3.7, description: 'Grain miller', imageUrl: '', premium: false },
    { name: 'Irrigation Machine', priceFBu: 500000, durationDays: 30, dailyPercent: 4, description: 'Water distribution', imageUrl: '', premium: false },
    { name: 'Crop Duster', priceFBu: 300000, durationDays: 30, dailyPercent: 3.8, description: 'Aerial spraying', imageUrl: '', premium: false },
    { name: 'Harvest Titan', priceFBu: 700000, durationDays: 30, dailyPercent: 4.5, description: 'Heavy-duty harvester', imageUrl: '', premium: true },
    { name: 'Pro Seeder 900', priceFBu: 900000, durationDays: 30, dailyPercent: 4.8, description: 'High capacity seeder', imageUrl: '', premium: true },
    { name: 'Mega Agro Combine', priceFBu: 1000000, durationDays: 30, dailyPercent: 5, description: 'All-in-one machine', imageUrl: '', premium: true },
    { name: 'Deep Well Driller', priceFBu: 320000, durationDays: 30, dailyPercent: 3.85, description: 'Borehole drilling equipment', imageUrl: '', premium: false },
    { name: 'Soil Nutrient Lab', priceFBu: 280000, durationDays: 30, dailyPercent: 3.75, description: 'Soil testing and analysis', imageUrl: '', premium: false },
    { name: 'Autonomous Crop Rover', priceFBu: 850000, durationDays: 30, dailyPercent: 4.75, description: 'Self-driving crop monitoring', imageUrl: '', premium: true },
    { name: 'Silo Storage Unit', priceFBu: 150000, durationDays: 30, dailyPercent: 3.55, description: 'Grain storage and drying', imageUrl: '', premium: false }
  ];

  const dbMachines = await Machine.findAll();
  console.log(`Currently in DB: ${dbMachines.length} machines.`);
  
  const planNames = plans.map(p => p.name);
  
  // 1. Identify and Remove extras (only if no investments)
  for (const dbM of dbMachines) {
    if (!planNames.includes(dbM.name)) {
      const invCount = await Investment.count({ where: { machineId: dbM.id } });
      if (invCount === 0) {
        await dbM.destroy();
        console.log(`🗑️ Removed extra plan: ${dbM.name}`);
      } else {
        console.log(`⚠️ Keeping extra plan ${dbM.name} because it has investments.`);
      }
    }
  }

  // 2. Ensure all 15 plans exist
  for (const plan of plans) {
    const exists = await Machine.findOne({ where: { name: plan.name } });
    if (!exists) {
      await Machine.create(plan);
      console.log(`✓ Added missing plan: ${plan.name}`);
    } else {
      // Update attributes to match exactly
      Object.assign(exists, plan);
      await exists.save();
      console.log(`📝 Updated/Synced: ${plan.name}`);
    }
  }

  const finalCount = await Machine.count();
  console.log(`Final machine count in registry: ${finalCount}`);
  process.exit();
}

arrange();
