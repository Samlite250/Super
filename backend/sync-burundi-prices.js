require('dotenv').config();
const { Machine } = require('./src/models');

async function syncPrices() {
  const plans = [
    { name: 'Tractor X200', priceFBu: 50000, dailyPercent: 3.0, premium: false },
    { name: 'Mini Cultivator', priceFBu: 100000, dailyPercent: 3.1, premium: false },
    { name: 'Plow Deluxe', priceFBu: 150000, dailyPercent: 3.2, premium: false },
    { name: 'Harvester Pro', priceFBu: 200000, dailyPercent: 3.3, premium: false },
    { name: 'Silo Storage Unit', priceFBu: 300000, dailyPercent: 3.4, premium: false },
    { name: 'Seeder M1', priceFBu: 350000, dailyPercent: 3.5, premium: false },
    { name: 'Miller 250', priceFBu: 400000, dailyPercent: 3.6, premium: false },
    { name: 'Soil Nutrient Lab', priceFBu: 450000, dailyPercent: 3.7, premium: false },
    { name: 'Deep Well Driller', priceFBu: 500000, dailyPercent: 3.8, premium: false },
    { name: 'Crop Duster', priceFBu: 550000, dailyPercent: 3.9, premium: false },
    { name: 'Irrigation Machine', priceFBu: 600000, dailyPercent: 4.1, premium: true },
    { name: 'Harvest Titan', priceFBu: 700000, dailyPercent: 4.3, premium: true },
    { name: 'Autonomous Crop Rover', priceFBu: 800000, dailyPercent: 4.5, premium: true },
    { name: 'Pro Seeder 900', priceFBu: 900000, dailyPercent: 4.7, premium: true },
    { name: 'Mega Agro Combine', priceFBu: 1000000, dailyPercent: 5.0, premium: true }
  ];

  for (const p of plans) {
    const m = await Machine.findOne({ where: { name: p.name } });
    if (m) {
      m.priceFBu = p.priceFBu;
      m.dailyPercent = p.dailyPercent;
      m.premium = p.premium;
      await m.save();
      console.log(`✓ Updated ${p.name} to ${p.priceFBu} FBu (${p.dailyPercent}%) [Premium: ${p.premium}]`);
    } else {
      console.log(`❌ Could not find ${p.name}`);
    }
  }
  console.log('Price Synchronization Complete.');
  process.exit();
}
syncPrices();
