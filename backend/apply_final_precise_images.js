require('dotenv').config();
const { Machine } = require('./src/models');

const finalSelection = [
  { 
    name: 'Soil Nutrient Lab', 
    id: 15, 
    imageUrl: 'https://images.unsplash.com/photo-1543206061-ce1bf31131f4?q=80&w=800&auto=format&fit=crop' // Laboratory testing equipment
  },
  { 
    name: 'Deep Well Driller', 
    id: 14, 
    imageUrl: 'https://images.unsplash.com/photo-1516937622598-6552e525bc0b?q=80&w=800&auto=format&fit=crop' // Industrial core drilling rig
  },
  { 
    name: 'Crop Duster', 
    id: 8, 
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop' // Modern agricultural sprayer machine
  },
  { 
    name: 'Irrigation Machine', 
    id: 7, 
    imageUrl: 'https://images.unsplash.com/photo-1542614391-419616353995?q=80&w=800&auto=format&fit=crop' // Precision pivot plumbing
  },
  { 
    name: 'Harvest Titan', 
    id: 9, 
    imageUrl: 'https://images.unsplash.com/photo-1563211516-0925e076735e?q=80&w=800&auto=format&fit=crop' // Heavy harvester unit
  },
  { 
    name: 'Pro Seeder 900', 
    id: 10, 
    imageUrl: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=800&auto=format&fit=crop' // Detail of seeding machinery rows
  },
  { 
    name: 'Mega Agro Combine', 
    id: 11, 
    imageUrl: 'https://images.unsplash.com/photo-1594911771146-24e037cc731a?q=80&w=800&auto=format&fit=crop' // Final top tier machine
  }
];

async function applyFinalImagery() {
  try {
    for (const item of finalSelection) {
      const [updated] = await Machine.update(
        { imageUrl: item.imageUrl }, 
        { where: { id: item.id } }
      );
      if (updated) {
        console.log(`✓ Applied professional machinery visual to plan: ${item.name} (ID: ${item.id})`);
      } else {
        console.log(`! No record found for ${item.name} (ID: ${item.id})`);
      }
    }
    console.log('\nSUCCESS: All premium plans have been professionalized with pure machinery imagery.');
    process.exit(0);
  } catch (err) {
    console.error('ERROR during update:', err);
    process.exit(1);
  }
}

applyFinalImagery();
