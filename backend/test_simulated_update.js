require('dotenv').config();
const { Machine } = require('./src/models');

async function testUpdate() {
  const id = 8; // Crop Duster
  try {
    const machine = await Machine.findByPk(id);
    console.log('Testing update on ID 8:', machine.name);
    
    // Simulate what the controller does
    machine.name = "Crop Duster TEST";
    machine.priceFBu = 550000.00;
    machine.durationDays = 30;
    machine.dailyPercent = 3.90;
    machine.premium = true;
    
    await machine.save();
    console.log('Update Success!');
    
    // Revert
    machine.name = "Crop Duster";
    await machine.save();
    console.log('Revert Success!');
    
    process.exit(0);
  } catch (err) {
    console.error('Simulated Update Failure:', err);
    process.exit(1);
  }
}
testUpdate();
