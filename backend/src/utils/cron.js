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
      
      const referenceDate = inv.lastReturnAt || inv.startDate;
      const lastReturnTime = new Date(referenceDate).getTime();
      const currentTime = now.getTime();
      const hoursPassed = (currentTime - lastReturnTime) / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        // Calculate income (use stored dailyIncome if available, otherwise fallback to percentage)
        let dailyIncome = 0;
        if (inv.dailyIncome && parseFloat(inv.dailyIncome) > 0) {
          dailyIncome = parseFloat(inv.dailyIncome);
        } else {
          dailyIncome = (parseFloat(inv.amount) * parseFloat(machine.dailyPercent)) / 100;
        }
        
        const t = await sequelize.transaction();
        try {
          // Increment user balance
          const oldBalance = parseFloat(user.balance || 0);
          user.balance = oldBalance + dailyIncome;
          await user.save({ transaction: t });
          
          // Update lastReturnAt to exactly 24h after the last return to prevent drift
          const newReturnDate = new Date(lastReturnTime + (24 * 60 * 60 * 1000));
          inv.lastReturnAt = newReturnDate;
          
          // Create transaction record
          await Transaction.create({ 
            userId: user.id, 
            type: 'earning', 
            amount: dailyIncome, 
            description: `Daily ROI: ${machine.name}` 
          }, { transaction: t });

          // Check if the investment lifecycle is over
          const start = new Date(inv.startDate);
          const durationDays = parseInt(machine.durationDays);
          const expiry = new Date(start.getTime() + (durationDays * 24 * 60 * 60 * 1000));
          
          if (now >= expiry) {
            inv.status = 'completed';
            console.log(`[ROI] Plan ${inv.id} completed for ${user.email}`);
          }

          await inv.save({ transaction: t });
          await t.commit();
          console.log(`[ROI] Dispatched ${dailyIncome} to ${user.email} (Balance: ${oldBalance} -> ${user.balance})`);
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
