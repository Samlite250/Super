require('dotenv').config();
const { Machine } = require('./src/models');

const imageMapping = [
  { id: 6,  imageUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800&auto=format&fit=crop' }, // Industrial Machine (Miller)
  { id: 15, imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop' }, // Laboratory/Tech (Soil Lab)
  { id: 14, imageUrl: 'https://images.unsplash.com/photo-1517055727180-d5a0cd07c94e?q=80&w=800&auto=format&fit=crop' }, // Well Driller (Water well rig) - NEW
  { id: 8,  imageUrl: 'https://images.unsplash.com/photo-1614704055260-2646d61d9047?q=80&w=800&auto=format&fit=crop' }, // Drone/Spray (Crop Duster)
  { id: 7,  imageUrl: 'https://images.unsplash.com/photo-1563514223351-1673344d5193?q=80&w=800&auto=format&fit=crop' }, // Irrigation (Irrigation sprinkler) - NEW
  { id: 9,  imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop' }, // Harvest Titan (Big field harvest) - NEW
  { id: 16, imageUrl: 'https://images.unsplash.com/photo-1523348830708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop' }, // Robotic Rover (Greenhouse robot) - NEW
  { id: 10, imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6b66b721?q=80&w=800&auto=format&fit=crop' }, // Professional Seeder (Modern agriculture) - NEW
  { id: 11, imageUrl: 'https://images.unsplash.com/photo-1594911771146-24e037cc731a?q=80&w=800&auto=format&fit=crop' }  // Mega Combine (Massive tractor) - NEW
];

async function updatePremiumImages() {
  try {
    for (const item of imageMapping) {
      await Machine.update({ imageUrl: item.imageUrl }, { where: { id: item.id } });
      console.log(`Updated Machine ID ${item.id} with high-visibility imagery.`);
    }
    console.log('Premium catalog updated.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updatePremiumImages();
