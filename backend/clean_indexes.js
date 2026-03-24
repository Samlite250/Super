const { sequelize } = require('./src/models');

async function cleanIndexes() {
  try {
    const [indexes] = await sequelize.query('SHOW INDEX FROM Users');
    console.log(`Found ${indexes.length} index entries.`);

    // Group by column or index name
    const grouped = {};
    for (const idx of indexes) {
        if (!grouped[idx.Key_name]) grouped[idx.Key_name] = [];
        grouped[idx.Key_name].push(idx.Column_name);
    }

    console.log('Index Names:', Object.keys(grouped));

    // Keep PRIMARY and the first of each unique column if possible
    // But usually for username/email/phone, they have many duplicate index names like "username_unique_1", "username_unique_2", etc? Or just same?
    
    for (const keyName of Object.keys(grouped)) {
        if (keyName === 'PRIMARY') continue;
        if (keyName === 'id') continue;
        
        // Check if it's a duplicate of something
        // Just drop anything that looks like a duplicate
        if (keyName.includes('_') || keyName.length > 20) {
            console.log(`Dropping suspected duplicate index: ${keyName}`);
            try {
                // MySQL syntax: ALTER TABLE tbl_name DROP INDEX index_name
                await sequelize.query(`ALTER TABLE Users DROP INDEX \`${keyName}\``);
            } catch (e) {
                console.error(`Failed to drop ${keyName}: ${e.message}`);
            }
        }
    }

    console.log('Index Cleanup Phase 1 Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal cleanup error:', err.message);
    process.exit(1);
  }
}

cleanIndexes();
