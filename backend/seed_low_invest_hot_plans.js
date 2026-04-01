require('dotenv').config();
const { Machine } = require('./src/models');

async function seedLowInvestHotPlans() {
  try {
    const plans = [
      {
        name: 'Starter Sprout Flash',
        description: 'Micro-investment for early harvest testing. High frequency returns.',
        price: 5000,
        priceFBu: 5000,
        dailyPercent: 2.15, // ~15% over 7 days
        durationDays: 7,
        type: 'hot',
        country: 'Global',
        imageUrl: '/tractor_agro.png'
      },
      {
        name: 'Weekend Mini Booster',
        description: 'Limited weekend-only growth accelerator. Quick 3-day cycle.',
        price: 15000,
        priceFBu: 15000,
        dailyPercent: 8.34, // ~25% over 3 days
        durationDays: 3,
        type: 'hot',
        country: 'Global',
        imageUrl: '/drone_agro.png'
      },
      {
        name: 'Community Harvest Core',
        description: 'Mid-tier flash sale for village community cooperatives.',
        price: 25000,
        priceFBu: 25000,
        dailyPercent: 4.0, // 20% over 5 days
        durationDays: 5,
        type: 'hot',
        country: 'Global',
        imageUrl: '/harvester_agro.png'
      },
      {
        name: 'Junior Drone Scout',
        description: 'Aerial monitoring stake for small-scale precision farming.',
        price: 50000,
        priceFBu: 50000,
        dailyPercent: 1.8, // 18% over 10 days
        durationDays: 10,
        type: 'hot',
        country: 'Global',
        imageUrl: '/drone_agro.png'
      }
    ];

    console.log('[SEED] Inserting low-invest hot plans...');
    for (const plan of plans) {
      await Machine.create(plan);
      console.log(` - Created: ${plan.name}`);
    }
    console.log('[SEED] Successfully seeded low-invest hot plans!');
    process.exit(0);
  } catch (err) {
    console.error('[SEED] Error:', err.message);
    if (err.errors) {
        err.errors.forEach(e => console.error(` - Validation error: ${e.message}`));
    }
    process.exit(1);
  }
}


seedLowInvestHotPlans();
