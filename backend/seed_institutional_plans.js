require('dotenv').config();
const { Machine } = require('./src/models');

async function seedInstitutionalPlans() {
  try {
    const plans = [
      {
        name: 'Elite Harvest Management',
        description: 'Industrial-scale agricultural management system. Co-funding a fleet of 5 automated harvesters.',
        priceFBu: 2500000, // ~ $850
        durationDays: 30,
        dailyPercent: 5.5,
        imageUrl: '/heavy_tractor_agro.png',
        premium: true,
        type: 'normal'
      },
      {
        name: 'Agro-Industrial Hub',
        description: 'Comprehensive processing hub for grain and legumes. High-capacity industrial throughput.',
        priceFBu: 5000000, // ~ $1,700
        durationDays: 45,
        dailyPercent: 6.0,
        imageUrl: '/silo_agro.png',
        premium: true,
        type: 'normal'
      },
      {
        name: 'Continental Fleet Commander',
        description: 'Participate in the cross-border logistics fleet moving agricultural produce across East Africa.',
        priceFBu: 10000000, // ~ $3,400
        durationDays: 60,
        dailyPercent: 6.5,
        imageUrl: '/drone_agro.png',
        premium: true,
        type: 'normal'
      },
      {
        name: 'Sovereign Wealth Asset',
        description: 'Direct stake in the Tracova regional processing center and logistics infrastructure.',
        priceFBu: 25000000, // ~ $8,500
        durationDays: 90,
        dailyPercent: 7.0,
        imageUrl: '/harvester_agro.png',
        premium: true,
        type: 'normal'
      }
    ];

    console.log('Seeding Institutional (High-Capital) Plans...');
    for (const p of plans) {
      const exists = await Machine.findOne({ where: { name: p.name } });
      if (!exists) {
        await Machine.create(p);
        console.log(`✓ Created High-Cap Plan: ${p.name}`);
      } else {
        console.log(`- High-Cap Plan exists: ${p.name}`);
      }
    }
    console.log('✓ Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedInstitutionalPlans();
