require('dotenv').config();
const { Machine } = require('./src/models');

const imageMapping = [
  // IDs corresponding to #1-#8 if they are missing
  { id: 5,  imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80' }, // Seeder
  { id: 6,  imageUrl: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?auto=format&fit=crop&w=800&q=80' }, // Miller
  { id: 15, imageUrl: 'https://images.unsplash.com/photo-1523348830708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80' }, // Soil Lab

  // IDs corresponding to #9-#15 (The ones visible in the screenshot)
  { id: 14, imageUrl: 'https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=800&q=80' }, // Deep Well Driller (Working well)
  { id: 8,  imageUrl: 'https://images.unsplash.com/photo-1464226330640-6924fde76775?auto=format&fit=crop&w=800&q=80' }, // Crop Duster (Aerial field)
  { id: 7,  imageUrl: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80' }, // Irrigation (Watering field)
  { id: 9,  imageUrl: 'https://images.unsplash.com/photo-1533510901844-42b75fcc131d?auto=format&fit=crop&w=800&q=80' }, // Harvest Titan (Big Harvester)
  { id: 16, imageUrl: 'https://images.unsplash.com/photo-1495107336281-19d80d927901?auto=format&fit=crop&w=800&q=80' }, // Crop Rover (Field robot look)
  { id: 10, imageUrl: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80' }, // Pro Seeder (Tractor seeding)
  { id: 11, imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' }  // Mega Combine (Massive field machinery)
];

async function updateAllImages() {
  try {
    for (const item of imageMapping) {
      await Machine.update({ imageUrl: item.imageUrl }, { where: { id: item.id } });
      console.log(`Updated Machine ID ${item.id} with highly reliable imagery.`);
    }
    console.log('Final image professionalization complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateAllImages();
