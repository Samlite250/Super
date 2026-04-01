const { Machine } = require('./models');
const { User } = require('./models'); // and any others if needed

async function seedHotPlans() {
  try {
    const plans = [
      {
        name: 'Rapid Harvest X1',
        description: 'Accelerated 4-day agricultural cycle with total maturation payout.',
        priceFBu: 100000,
        durationDays: 4,
        dailyPercent: 12.5, // 50% total profit in 4 days
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      },
      {
        name: 'Flash Seeder Pro',
        description: 'Short-term high-velocity seeding contract.',
        priceFBu: 250000,
        durationDays: 5,
        dailyPercent: 10, // 50% total profit in 5 days
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      },
      {
        name: 'Premium Hot Tractor',
        description: 'Exclusive 4-day heavy equipment lease for maximum returns.',
        priceFBu: 600000,
        durationDays: 4,
        dailyPercent: 15, // 60% total profit in 4 days
        type: 'hot',
        payoutType: 'total',
        country: 'Global'
      }
    ];

    for (const p of plans) {
      const existing = await Machine.findOne({ where: { name: p.name } });
      if (!existing) {
        await Machine.create(p);
        console.log(`Created hot plan: ${p.name}`);
      } else {
        console.log(`Plan already exists: ${p.name}`);
      }
    }
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedHotPlans();
