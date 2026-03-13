const { Machine } = require('./models');
async function check() {
  const count = await Machine.count();
  console.log('Current machine count:', count);
  const machines = await Machine.findAll({ attributes: ['name'] });
  machines.forEach(m => console.log(' - ' + m.name));
  process.exit();
}
check();
