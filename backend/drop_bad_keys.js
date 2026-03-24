const { sequelize } = require('./src/models');

async function dropRedundantIndexes() {
  try {
    const [indexes] = await sequelize.query('SHOW INDEX FROM Users');
    const keyNames = Array.from(new Set(indexes.map(i => i.Key_name)));
    console.log(`Initial keys: ${keyNames.length}`);

    for (const kn of keyNames) {
        // Keep PRIMARY and basic ones
        if (kn === 'PRIMARY') continue;
        if (kn === 'referredBy') continue; // assuming it's an FK index or useful

        // If it looks like a duplicate index from a previous sync (e.g. email_2, phone_9)
        if (kn.match(/_\d+$/)) {
            console.log(`Dropping redundant index: ${kn}`);
            await sequelize.query(`ALTER TABLE Users DROP INDEX \`${kn}\``);
        }
    }

    console.log('Index cleanup finished.');
    process.exit(0);
  } catch (err) {
    console.error('Error in cleanup:', err.message);
    process.exit(1);
  }
}

dropRedundantIndexes();
