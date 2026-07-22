"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = initCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../db");
const shared_1 = require("../types/shared");
function initCronJobs() {
    // Run daily at midnight
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily policy status maintenance job...');
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        try {
            // 1. Mark expired policies
            const expiredCount = await db_1.db.policy.updateMany({
                where: {
                    endDate: { lt: now },
                    status: { in: [shared_1.PolicyStatus.ACTIVE, shared_1.PolicyStatus.RENEWAL_DUE] },
                },
                data: { status: shared_1.PolicyStatus.EXPIRED },
            });
            // 2. Mark policies due for renewal (within 30 days)
            const renewalCount = await db_1.db.policy.updateMany({
                where: {
                    endDate: { lte: thirtyDaysFromNow, gte: now },
                    status: shared_1.PolicyStatus.ACTIVE,
                },
                data: { status: shared_1.PolicyStatus.RENEWAL_DUE },
            });
            // 3. Mark overdue payments
            const overdueCount = await db_1.db.payment.updateMany({
                where: {
                    dueDate: { lt: now },
                    paymentStatus: shared_1.PaymentStatus.PENDING,
                },
                data: { paymentStatus: shared_1.PaymentStatus.OVERDUE },
            });
            console.log(`[CRON COMPLETED] Expired: ${expiredCount.count}, Renewal Due: ${renewalCount.count}, Overdue Payments: ${overdueCount.count}`);
        }
        catch (err) {
            console.error('[CRON ERROR]', err);
        }
    });
    console.log('[CRON] Scheduled background maintenance jobs initialized.');
}
