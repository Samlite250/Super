const { sequelize, Machine, Admin, ExchangeRate, Setting } = require('./models');
const bcrypt = require('bcrypt');

async function run() {
  await sequelize.sync({ force: true });
  // create admin
  const hash = await bcrypt.hash('adminpass', 10);
  await Admin.create({ username: 'admin', password: hash });

  // create exchange rates
  await ExchangeRate.bulkCreate([
    { currency: 'RWF', rateToFBu: 0.35 },
    { currency: 'UGX', rateToFBu: 0.0035 },
    { currency: 'KES', rateToFBu: 0.028 }
  ]);

  // create default settings
  await Setting.bulkCreate([
    { key: 'REFERRAL_PERCENTAGE', value: '5' },
    { key: 'MIN_WITHDRAWAL', value: '10000' },
    { key: 'WITHDRAWAL_FEE', value: '0.02' }
  ]);

  // seed machines
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
  await Machine.bulkCreate(plans);

  console.log('Seed complete');
  process.exit();
}

run();