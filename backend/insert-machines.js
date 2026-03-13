require('dotenv').config();
const { Machine } = require('./src/models');

async function run() {
  try {
    const plans = [
      { name: 'Tractor X200', priceFBu: 50000, durationDays: 30, dailyPercent: 3.0, description: 'Basic soil preparation tractor.', imageUrl: '', premium: false },
      { name: 'Mini Cultivator', priceFBu: 100000, durationDays: 30, dailyPercent: 3.1, description: 'Efficient weeding and cultivation.', imageUrl: '', premium: false },
      { name: 'Plow Deluxe', priceFBu: 150000, durationDays: 30, dailyPercent: 3.2, description: 'Deep earth plowing system.', imageUrl: '', premium: false },
      { name: 'Harvester Pro', priceFBu: 200000, durationDays: 30, dailyPercent: 3.3, description: 'Optimized crop collection.', imageUrl: '', premium: false },
      { name: 'Silo Storage Unit', priceFBu: 300000, durationDays: 30, dailyPercent: 3.4, description: 'Grain storage and moisture control.', imageUrl: '', premium: false },
      { name: 'Seeder M1', priceFBu: 350000, durationDays: 30, dailyPercent: 3.5, description: 'High precision planting.', imageUrl: '', premium: false },
      { name: 'Miller 250', priceFBu: 400000, durationDays: 30, dailyPercent: 3.6, description: 'Grain processing and milling.', imageUrl: '', premium: false },
      { name: 'Soil Nutrient Lab', priceFBu: 450000, durationDays: 30, dailyPercent: 3.7, description: 'Automated soil testing and recovery.', imageUrl: '', premium: false },
      { name: 'Deep Well Driller', priceFBu: 500000, durationDays: 30, dailyPercent: 3.8, description: 'Borehole drilling for steady irrigation.', imageUrl: '', premium: false },
      { name: 'Crop Duster', priceFBu: 550000, durationDays: 30, dailyPercent: 3.9, description: 'Advanced aerial pest control.', imageUrl: '', premium: false },
      { name: 'Irrigation Machine', priceFBu: 600000, durationDays: 30, dailyPercent: 4.1, description: 'Smart water distribution network.', imageUrl: '', premium: true },
      { name: 'Harvest Titan', priceFBu: 700000, durationDays: 30, dailyPercent: 4.3, description: 'Ultra-heavy-duty harvesting node.', imageUrl: '', premium: true },
      { name: 'Autonomous Crop Rover', priceFBu: 800000, durationDays: 30, dailyPercent: 4.5, description: 'Self-driving AI crop monitoring.', imageUrl: '', premium: true },
      { name: 'Pro Seeder 900', priceFBu: 900000, durationDays: 30, dailyPercent: 4.7, description: 'High-speed automated seeding cluster.', imageUrl: '', premium: true },
      { name: 'Mega Agro Combine', priceFBu: 1000000, durationDays: 30, dailyPercent: 5.0, description: 'Global scale agricultural super-machine.', imageUrl: '', premium: true }
    ];
    
    console.log('Inserting machines...');
    for (const plan of plans) {
      const exists = await Machine.findOne({ where: { name: plan.name } });
      if (!exists) {
        await Machine.create(plan);
        console.log(`✓ Created: ${plan.name}`);
      } else {
        console.log(`- Already exists: ${plan.name}`);
      }
    }
    
    console.log('✓ Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
