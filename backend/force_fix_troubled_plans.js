require('dotenv').config();
const { Machine } = require('./src/models');

const criticalFixes = [
  { id: 15, name: 'Soil Nutrient Lab', img: 'https://images.unsplash.com/photo-1579154235884-332c397e383e?q=80&w=800&auto=format&fit=crop' }, // Pure lab equipment
  { id: 14, name: 'Deep Well Driller', img: 'https://images.unsplash.com/photo-1541888946425-d81bb1930060?q=80&w=800&auto=format&fit=crop' }, // Pure drill machine
  { id: 8,  name: 'Crop Duster',      img: 'https://images.unsplash.com/photo-1506485338023-6ce5f36692df?q=80&w=800&auto=format&fit=crop' }  // Precision spray unit
];

async function fixTroubledPlans() {
  try {
    for (const item of criticalFixes) {
      const machine = await Machine.findByPk(item.id);
      if (machine) {
        machine.imageUrl = item.img;
        // Ensure all required fields are populated to avoid DB validation errors
        machine.priceFBu = machine.priceFBu || 500000;
        machine.durationDays = machine.durationDays || 30;
        machine.dailyPercent = machine.dailyPercent || 3.5;
        await machine.save();
        console.log(`✓ Force-updated: ${item.name} with certified machine-only visual.`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Manual Update Error:', err);
    process.exit(1);
  }
}
fixTroubledPlans();
