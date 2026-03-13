require('dotenv').config();
const { Machine } = require('./src/models');

async function check() {
  const machines = await Machine.findAll();
  machines.forEach(m => {
    console.log(`ID: ${m.id}, Name: ${m.name}, Image: ${m.imageUrl}`);
  });
  process.exit();
}
check();
