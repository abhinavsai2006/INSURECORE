"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimService = void 0;
const db_1 = require("../db");
const audit_1 = require("./audit");
exports.claimService = {
    // Generate a unique claim number
    generateClaimNumber: async () => {
        const year = new Date().getFullYear();
        // Find the highest sequence number for this year
        const lastClaim = await db_1.db.claim.findFirst({
            where: {
                claimNumber: {
                    startsWith: `CLM-${year}-`,
                },
            },
            orderBy: {
                claimNumber: 'desc',
            },
            select: {
                claimNumber: true,
            },
        });
        let sequence = 1;
        if (lastClaim?.claimNumber) {
            // Extract the sequence number from the last claim
            const match = lastClaim.claimNumber.match(/CLM-\d{4}-(\d{6})/);
            if (match) {
                sequence = parseInt(match[1], 10) + 1;
            }
        }
        // Format as CLM-YYYY-XXXXXX (6 digits)
        const sequenceStr = sequence.toString().padStart(6, '0');
        return `CLM-${year}-${sequenceStr}`;
    },
    // Create a new claim
    create: async (data, userId) => {
        // Generate claim number
        const claimNumber = await exports.claimService.generateClaimNumber();
        const claim = await db_1.db.claim.create({
            data: {
                ...data,
                claimNumber,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'CLAIM_CREATED', 'Claim', claim.id, {
            claimNumber,
            policyId: claim.policyId,
        });
        return claim;
    },
    // Find a claim by ID
    findById: async (id) => {
        return db_1.db.claim.findUnique({
            where: { id },
            include: {
                policy: {
                    include: { customer: true }
                },
                documents: true,
            },
        });
    },
    // Find a claim by claim number
    findByClaimNumber: async (claimNumber) => {
        return db_1.db.claim.findUnique({
            where: { claimNumber },
            include: {
                policy: {
                    include: { customer: true }
                },
                documents: true,
            },
        });
    },
    // Get claims with filtering and pagination
    findMany: async (params) => {
        const { skip, take, cursor, where, orderBy } = params;
        return db_1.db.claim.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                policy: {
                    include: { customer: true }
                }
            }
        });
    },
    // Update a claim
    update: async (params) => {
        const { where, data } = params;
        return db_1.db.claim.update({ where, data });
    },
    // Delete a claim
    delete: async (where) => {
        return db_1.db.claim.delete({ where });
    },
    // Update claim status (with validation for state transitions)
    updateStatus: async (params) => {
        const { claimId, status, approvedAmount, reviewNotes, userId } = params;
        // Get current claim
        const claim = await db_1.db.claim.findUnique({
            where: { id: claimId },
            include: { policy: true }
        });
        if (!claim) {
            throw new Error('Claim not found');
        }
        // Validate state transition
        const validTransitions = {
            SUBMITTED: ['UNDER_REVIEW'],
            UNDER_REVIEW: ['APPROVED', 'REJECTED'],
            APPROVED: ['SETTLED'],
            REJECTED: [], // Final state
            SETTLED: [], // Final state
        };
        if (!validTransitions[claim.status]?.includes(status)) {
            throw new Error(`Invalid transition from ${claim.status} to ${status}`);
        }
        // Validate approved amount for approval
        if (status === 'APPROVED' && approvedAmount === undefined) {
            throw new Error('Approved amount is required when approving a claim');
        }
        // Validate that approved amount doesn't exceed claim amount
        if (approvedAmount !== undefined && approvedAmount > claim.claimAmount) {
            throw new Error('Approved amount cannot exceed claim amount');
        }
        // Update the claim
        const updatedClaim = await db_1.db.claim.update({
            where: { id: claimId },
            data: {
                status,
                approvedAmount: approvedAmount ?? null,
                reviewNotes: reviewNotes ?? null,
                resolvedDate: status === 'SETTLED' ? new Date() : undefined,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'CLAIM_STATUS_UPDATED', 'Claim', claimId, {
            previousStatus: claim.status,
            newStatus: status,
            approvedAmount,
            reviewNotes
        });
        return updatedClaim;
    },
    // Get claims by status
    getByStatus: async (status) => {
        return db_1.db.claim.findMany({
            where: { status },
            include: {
                policy: {
                    include: { customer: true }
                }
            },
            orderBy: { submissionDate: 'desc' }
        });
    },
    // Get claims for a specific policy
    getByPolicyId: async (policyId) => {
        return db_1.db.claim.findMany({
            where: { policyId },
            include: { documents: true },
            orderBy: { submissionDate: 'desc' }
        });
    },
    // Get claim statistics
    getStatistics: async () => {
        const [total, byStatus, avgProcessingTime] = await Promise.all([
            db_1.db.claim.count(),
            db_1.db.claim.groupBy({
                by: ['status'],
                _count: true,
            }),
            db_1.db.claim.aggregate({
                _avg: {
                // This would need to be calculated based on submission and resolved dates
                // For simplicity, we'll skip complex calculation here
                },
                where: {
                    status: 'SETTLED',
                    resolvedDate: { not: null }
                }
            })
        ]);
        const statusCounts = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {});
        return {
            total,
            byStatus: statusCounts,
        };
    },
    // Get pending claims (for agent dashboard)
    getPendingReview: async () => {
        return db_1.db.claim.findMany({
            where: { status: 'SUBMITTED' },
            include: {
                policy: {
                    include: { customer: true }
                }
            },
            orderBy: { submissionDate: 'asc' }
        });
    }
};
