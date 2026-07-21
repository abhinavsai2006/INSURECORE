"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyService = void 0;
const db_1 = require("../db");
const audit_1 = require("./audit");
exports.policyService = {
    // Generate a unique policy number
    generatePolicyNumber: async () => {
        const year = new Date().getFullYear();
        // Find the highest sequence number for this year
        const lastPolicy = await db_1.db.policy.findFirst({
            where: {
                policyNumber: {
                    startsWith: `POL-${year}-`,
                },
            },
            orderBy: {
                policyNumber: 'desc',
            },
            select: {
                policyNumber: true,
            },
        });
        let sequence = 1;
        if (lastPolicy?.policyNumber) {
            // Extract the sequence number from the last policy
            const match = lastPolicy.policyNumber.match(/POL-\d{4}-(\d{6})/);
            if (match) {
                sequence = parseInt(match[1], 10) + 1;
            }
        }
        // Format as POL-YYYY-XXXXXX (6 digits)
        const sequenceStr = sequence.toString().padStart(6, '0');
        return `POL-${year}-${sequenceStr}`;
    },
    // Create a new policy
    create: async (data, userId) => {
        // Generate policy number
        const policyNumber = await exports.policyService.generatePolicyNumber();
        const policy = await db_1.db.policy.create({
            data: {
                ...data,
                policyNumber,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'POLICY_CREATED', 'Policy', policy.id, {
            policyNumber,
            customerId: policy.customerId,
        });
        return policy;
    },
    // Find a policy by ID
    findById: async (id) => {
        return db_1.db.policy.findUnique({
            where: { id },
            include: {
                customer: true,
                agent: true,
                claims: true,
                payments: true,
                documents: true,
            },
        });
    },
    // Find a policy by policy number
    findByPolicyNumber: async (policyNumber) => {
        return db_1.db.policy.findUnique({
            where: { policyNumber },
            include: {
                customer: true,
                agent: true,
                claims: true,
                payments: true,
                documents: true,
            },
        });
    },
    // Get policies with filtering and pagination
    findMany: async (params) => {
        const { skip, take, cursor, where, orderBy } = params;
        return db_1.db.policy.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                customer: true,
                agent: true,
            },
        });
    },
    // Update a policy
    update: async (params) => {
        const { where, data } = params;
        return db_1.db.policy.update({ where, data });
    },
    // Delete a policy
    delete: async (where) => {
        return db_1.db.policy.delete({ where });
    },
    // Activate a policy (PENDING -> ACTIVE)
    activate: async (policyId, userId) => {
        const policy = await db_1.db.policy.findUnique({
            where: { id: policyId },
        });
        if (!policy) {
            throw new Error('Policy not found');
        }
        if (policy.status !== 'PENDING') {
            throw new Error('Only pending policies can be activated');
        }
        const updatedPolicy = await db_1.db.policy.update({
            where: { id: policyId },
            data: { status: 'ACTIVE' },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'POLICY_ACTIVATED', 'Policy', policyId, {
            previousStatus: policy.status,
            newStatus: 'ACTIVE'
        });
        return updatedPolicy;
    },
    // Cancel a policy
    cancel: async (params) => {
        const { policyId, userId, reason } = params;
        const policy = await db_1.db.policy.findUnique({
            where: { id: policyId },
        });
        if (!policy) {
            throw new Error('Policy not found');
        }
        if (policy.status === 'CANCELLED' || policy.status === 'EXPIRED') {
            throw new Error('Policy is already cancelled or expired');
        }
        const updatedPolicy = await db_1.db.policy.update({
            where: { id: policyId },
            data: { status: 'CANCELLED' },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'POLICY_CANCELLED', 'Policy', policyId, {
            previousStatus: policy.status,
            newStatus: 'CANCELLED',
            reason
        });
        return updatedPolicy;
    },
    // Renew a policy
    renew: async (params) => {
        const { policyId, userId, premiumAmount, startDate, endDate } = params;
        const policy = await db_1.db.policy.findUnique({
            where: { id: policyId },
            include: { customer: true }
        });
        if (!policy) {
            throw new Error('Policy not found');
        }
        // Only active or renewal_due policies can be renewed
        if (!['ACTIVE', 'RENEWAL_DUE'].includes(policy.status)) {
            throw new Error('Only active or renewal due policies can be renewed');
        }
        // Calculate new dates if not provided
        const newStartDate = startDate ?? policy.endDate;
        const newEndDate = endDate ?? new Date(newStartDate.getFullYear() + 1, newStartDate.getMonth(), newStartDate.getDate());
        // Generate new policy number for renewal
        const newPolicyNumber = await exports.policyService.generatePolicyNumber();
        // Create the renewed policy
        const renewedPolicy = await db_1.db.policy.create({
            data: {
                policyNumber: newPolicyNumber,
                customerId: policy.customerId,
                agentId: policy.agentId,
                policyType: policy.policyType,
                planName: policy.planName,
                sumInsured: policy.sumInsured,
                premiumAmount: premiumAmount ?? policy.premiumAmount,
                premiumFrequency: policy.premiumFrequency,
                startDate: newStartDate,
                endDate: newEndDate,
                status: 'PENDING', // New policy starts as pending
                nominee: policy.nominee,
            },
        });
        // Update original policy to indicate it's been renewed (optional)
        // You could set a flag or keep track of renewals differently
        // Log audit
        await (0, audit_1.logAudit)(userId, 'POLICY_RENEWED', 'Policy', policyId, {
            originalPolicyId: policyId,
            newPolicyId: renewedPolicy.id,
            newPolicyNumber: renewedPolicy.policyNumber
        });
        return renewedPolicy;
    },
    // Get policies expiring soon (for renewal dashboard)
    getExpiringSoon: async (days = 30) => {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return db_1.db.policy.findMany({
            where: {
                status: 'ACTIVE',
                endDate: {
                    gte: now,
                    lte: futureDate,
                },
            },
            include: { customer: true, agent: true },
            orderBy: { endDate: 'asc' },
        });
    },
    // Get policies by status
    getByStatus: async (status) => {
        return db_1.db.policy.findMany({
            where: { status },
            include: { customer: true, agent: true },
            orderBy: { createdAt: 'desc' }
        });
    },
    // Get policy statistics
    getStatistics: async () => {
        const [total, byStatus, byType] = await Promise.all([
            db_1.db.policy.count(),
            db_1.db.policy.groupBy({
                by: ['status'],
                _count: true,
            }),
            db_1.db.policy.groupBy({
                by: ['policyType'],
                _count: true,
            }),
        ]);
        const statusCounts = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {});
        const typeCounts = byType.reduce((acc, item) => {
            acc[item.policyType] = item._count;
            return acc;
        }, {});
        return {
            total,
            byStatus: statusCounts,
            byType: typeCounts,
        };
    },
    // Set policy to renewal due status (called by cron job)
    setRenewalDue: async () => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const policies = await db_1.db.policy.updateMany({
            where: {
                status: 'ACTIVE',
                endDate: {
                    gte: new Date(),
                    lte: thirtyDaysFromNow,
                },
            },
            data: { status: 'RENEWAL_DUE' },
        });
        return policies.count;
    },
    // Set expired policies (called by cron job)
    setExpired: async () => {
        const now = new Date();
        const policies = await db_1.db.policy.updateMany({
            where: {
                status: {
                    in: ['ACTIVE', 'RENEWAL_DUE']
                },
                endDate: {
                    lt: now,
                },
            },
            data: { status: 'EXPIRED' },
        });
        return policies.count;
    },
};
