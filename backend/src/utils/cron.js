require('dotenv').config();
const { Investment, User, Transaction, Machine, sequelize } = require('../models');
const cron = require('node-cron');

async function calculateDailyReturns() {
  const now = new Date();
  console.log(`[CRON] Starting ROI distribution at ${now.toISOString()}`);
  
  try {
    const investments = await Investment.findAll({ 
      where: { status: 'active' }, 
      include: [Machine, User] 
    });

    for (const inv of investments) {
      if (!inv.Machine || !inv.User) continue;

      const machine = inv.Machine;
      const user = inv.User;
      
      // Calculate how much time has passed since the last return or start date
      const referenceDate = inv.lastReturnAt || inv.startDate;
      const hoursPassed = (now - new Date(referenceDate)) / (1000 * 60 * 60);

      // Only give ROI if 24 hours have passed
      if (hoursPassed >= 24) {
        const dailyIncome = (parseFloat(inv.amount) * parseFloat(machine.dailyPercent)) / 100;
        
        const t = await sequelize.transaction();
        try {
          // Increment user balance
          user.balance = parseFloat(user.balance) + dailyIncome;
          await user.save({ transaction: t });
          
          // Update lastReturnAt
          inv.lastReturnAt = now;
          
          // Create transaction record
          await Transaction.create({ 
            userId: user.id, 
            type: 'earning', 
            amount: dailyIncome, 
            description: `Daily ROI: ${machine.name}` 
          }, { transaction: t });

          // Check if the investment lifecycle is over
          const start = new Date(inv.startDate);
          const expiry = new Date(start.getTime() + (machine.durationDays * 24 * 60 * 60 * 1000));
          
          if (now >= expiry) {
            inv.status = 'completed';
            console.log(`[ROI] Plan ${inv.id} completed for ${user.email}`);
          }

          await inv.save({ transaction: t });
          await t.commit();
          console.log(`[ROI] Dispatched ${dailyIncome} to ${user.email} for ${machine.name}`);
        } catch (err) {
          await t.rollback();
          console.error(`[ROI] Failed for investment ${inv.id}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('[CRON] ROI distribution error:', error);
  }
}

// Scheduled to run every hour to check for due ROIs
const startCron = () => {
  cron.schedule('0 * * * *', () => {
    calculateDailyReturns();
  });
  console.log('[CRON] ROI scheduler synchronized.');
};

// Also allow manual run if required
if (require.main === module) {
  calculateDailyReturns().then(() => {
    console.log('[CRON] Manual run finished.');
    process.exit(0);
  });
}

module.exports = { calculateDailyReturns, startCron };
