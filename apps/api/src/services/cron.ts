import cron from 'node-cron';
import { db } from '../db';
import { PolicyStatus, PaymentStatus } from '../types/shared';

export function initCronJobs() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily policy status maintenance job...');
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    try {
      // 1. Mark expired policies
      const expiredCount = await db.policy.updateMany({
        where: {
          endDate: { lt: now },
          status: { in: [PolicyStatus.ACTIVE, PolicyStatus.RENEWAL_DUE] },
        },
        data: { status: PolicyStatus.EXPIRED },
      });

      // 2. Mark policies due for renewal (within 30 days)
      const renewalCount = await db.policy.updateMany({
        where: {
          endDate: { lte: thirtyDaysFromNow, gte: now },
          status: PolicyStatus.ACTIVE,
        },
        data: { status: PolicyStatus.RENEWAL_DUE },
      });

      // 3. Mark overdue payments
      const overdueCount = await db.payment.updateMany({
        where: {
          dueDate: { lt: now },
          paymentStatus: PaymentStatus.PENDING,
        },
        data: { paymentStatus: PaymentStatus.OVERDUE },
      });

      console.log(
        `[CRON COMPLETED] Expired: ${expiredCount.count}, Renewal Due: ${renewalCount.count}, Overdue Payments: ${overdueCount.count}`
      );
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  });

  console.log('[CRON] Scheduled background maintenance jobs initialized.');
}
