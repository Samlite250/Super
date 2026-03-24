const { Setting } = require('./src/models');

async function seedSignupBonuses() {
  try {
    const bonuses = [
      { key: 'signup_bonus_Rwanda', value: '500' },
      { key: 'signup_bonus_Kenya', value: '250' },
      { key: 'signup_bonus_Burundi', value: '1000' },
      { key: 'signup_bonus_Uganda', value: '1000' }
    ];

    for (const b of bonuses) {
      await Setting.upsert(b);
      console.log(`Set ${b.key} to ${b.value}`);
    }
    console.log('Signup Bonuses Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding bonuses:', err);
    process.exit(1);
  }
}

seedSignupBonuses();
