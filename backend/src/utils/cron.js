require('dotenv').config();
const { Investment, User, Transaction, Machine, sequelize } = require('../models');
const cron = require('node-cron');

async function calculateDailyReturns(targetUserId = null) {
  const now = new Date();
  console.log(`[CRON] Starting ROI distribution at ${now.toISOString()}${targetUserId ? ` for user ${targetUserId}` : ''}`);
  
  try {
    const whereClause = { status: 'active' };
    if (targetUserId) {
      whereClause.userId = targetUserId;
    }

    const investments = await Investment.findAll({ 
      where: whereClause, 
      include: [Machine, User] 
    });

    for (const inv of investments) {
      if (!inv.Machine || !inv.User) continue;

      const machine = inv.Machine;
      const user = inv.User;
      const payoutType = machine.payoutType || 'daily';
      
      let referenceDate = inv.lastReturnAt || inv.startDate;
      let lastReturnTime = new Date(referenceDate).getTime();
      let currentTime = now.getTime();
      let hoursPassed = (currentTime - lastReturnTime) / (1000 * 60 * 60);

      // --- HANDLE TOTAL PAYOUT (e.g., Short-term "Hot Plans") ---
      if (payoutType === 'total') {
        const start = new Date(inv.startDate);
        const durationDays = parseInt(machine.durationDays);
        const expiry = new Date(start.getTime() + (durationDays * 24 * 60 * 60 * 1000));

        // Only pay out if we've reached or passed the expiry date AND haven't paid yet
        if (now >= expiry && !inv.lastReturnAt) {
          const totalIncome = (parseFloat(inv.amount) * parseFloat(machine.dailyPercent) * durationDays) / 100;
          
          const t = await sequelize.transaction();
          try {
            await User.increment({ balance: totalIncome }, { where: { id: user.id }, transaction: t });
            inv.status = 'completed';
            inv.lastReturnAt = now;
            await inv.save({ transaction: t });
            
            await Transaction.create({ 
              userId: user.id, 
              type: 'earning', 
              amount: totalIncome, 
              description: `Matured ROI: ${machine.name} (${durationDays} days)` 
            }, { transaction: t });

            await t.commit();
            console.log(`[ROI-TOTAL] Dispatched ${totalIncome} to ${user.email} for matured plan ${inv.id}`);
          } catch (err) {
            await t.rollback();
            console.error(`[ROI-TOTAL] Failed for investment ${inv.id}:`, err);
          }
        }
        continue; // Skip the daily loop for total payout plans
      }

      // --- HANDLE DAILY PAYOUT (Standard Plans) ---
      while (hoursPassed >= 24) {
        // Calculate income (use stored dailyIncome if available, otherwise fallback to percentage)
        let dailyIncome = 0;
        if (inv.dailyIncome && parseFloat(inv.dailyIncome) > 0) {
          dailyIncome = parseFloat(inv.dailyIncome);
        } else {
          dailyIncome = (parseFloat(inv.amount) * parseFloat(machine.dailyPercent)) / 100;
        }
        
        const t = await sequelize.transaction();
        try {
          // Acquire row lock to prevent double processing in parallel requests
          const lockedInv = await Investment.findByPk(inv.id, { transaction: t, lock: t.LOCK.UPDATE });
          if (!lockedInv || lockedInv.status !== 'active') {
            await t.rollback();
            break;
          }
          
          let currentLockedReturnTime = new Date(lockedInv.lastReturnAt || lockedInv.startDate).getTime();
          if ((currentTime - currentLockedReturnTime) / (1000 * 60 * 60) < 24) {
            await t.rollback();
            break;
          }
          
          // Use atomic increment for user balance to prevent overlapping updates
          await User.increment({ balance: dailyIncome }, { where: { id: user.id }, transaction: t });
          user.balance = parseFloat(user.balance || 0) + dailyIncome; // Update local instance for logging
          
          // Update lastReturnAt to exactly 24h after the last return to prevent drift
          const newReturnDate = new Date(lastReturnTime + (24 * 60 * 60 * 1000));
          lockedInv.lastReturnAt = newReturnDate;
          
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
          
          if (newReturnDate >= expiry) {
            lockedInv.status = 'completed';
            console.log(`[ROI] Plan ${lockedInv.id} completed for ${user.email}`);
          }

          await lockedInv.save({ transaction: t });
          await t.commit();
          
          // Update variables for the next iteration of the catch-up loop
          inv.lastReturnAt = newReturnDate;
          inv.status = lockedInv.status;
          lastReturnTime = newReturnDate.getTime();
          hoursPassed = (currentTime - lastReturnTime) / (1000 * 60 * 60);

          console.log(`[ROI] Dispatched ${dailyIncome} to ${user.email} (New Balance approximately: ${user.balance})`);
          
          if (inv.status === 'completed') break;
        } catch (err) {
          await t.rollback();
          console.error(`[ROI] Failed for investment ${inv.id}:`, err);
          break; // Exit loop to avoid infinite stuck
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
