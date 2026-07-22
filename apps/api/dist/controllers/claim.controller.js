"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaims = getClaims;
exports.createClaim = createClaim;
exports.getClaimById = getClaimById;
exports.updateClaimStatus = updateClaimStatus;
exports.getClaimTimeline = getClaimTimeline;
const db_1 = require("../db");
const shared_1 = require("../types/shared");
const audit_1 = require("../services/audit");
async function getClaims(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const status = req.query.status;
        const conditions = [];
        if (req.user?.role === shared_1.Role.CUSTOMER) {
            if (!req.user.customerId) {
                return res.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }
            conditions.push({ policy: { customerId: req.user.customerId } });
        }
        if (status) {
            conditions.push({ status });
        }
        if (search) {
            conditions.push({
                OR: [
                    { claimNumber: { contains: search } },
                    { reason: { contains: search } },
                ],
            });
        }
        const where = conditions.length > 0 ? { AND: conditions } : {};
        const [total, claims] = await Promise.all([
            db_1.db.claim.count({ where }),
            db_1.db.claim.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { submissionDate: 'desc' },
                include: {
                    policy: {
                        include: {
                            customer: { select: { id: true, name: true, email: true } },
                        },
                    },
                    reviewedBy: { select: { id: true, name: true } },
                },
            }),
        ]);
        return res.json({
            data: claims,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function createClaim(req, res, next) {
    try {
        const input = shared_1.createClaimSchema.parse(req.body);
        const count = await db_1.db.claim.count();
        const year = new Date().getFullYear();
        const seq = String(count + 1).padStart(6, '0');
        const claimNumber = `CLM-${year}-${seq}`;
        const claim = await db_1.db.claim.create({
            data: {
                claimNumber,
                policyId: input.policyId,
                claimAmount: input.claimAmount,
                reason: input.reason,
                description: input.description,
                status: shared_1.ClaimStatus.SUBMITTED,
            },
            include: {
                policy: { include: { customer: true } },
            },
        });
        if (req.user?.id) {
            await (0, audit_1.logAudit)(req.user.id, 'SUBMIT_CLAIM', 'Claim', claim.id, { claimNumber, amount: input.claimAmount });
        }
        return res.status(201).json({
            data: claim,
            message: `Claim ${claimNumber} submitted successfully`,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getClaimById(req, res, next) {
    try {
        const { id } = req.params;
        const claim = await db_1.db.claim.findUnique({
            where: { id },
            include: {
                policy: {
                    include: {
                        customer: true,
                        agent: true,
                    },
                },
                documents: true,
            },
        });
        if (!claim) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Claim not found' } });
        }
        return res.json({ data: claim });
    }
    catch (err) {
        next(err);
    }
}
async function updateClaimStatus(req, res, next) {
    try {
        const { id } = req.params;
        const input = shared_1.updateClaimStatusSchema.parse(req.body);
        const claim = await db_1.db.claim.findUnique({ where: { id } });
        if (!claim) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Claim not found' } });
        }
        const currentStatus = claim.status;
        const newStatus = input.status;
        const updated = await db_1.db.claim.update({
            where: { id },
            data: {
                status: newStatus,
                approvedAmount: input.approvedAmount !== undefined ? input.approvedAmount : claim.approvedAmount,
                reviewNotes: input.reviewNotes !== undefined ? input.reviewNotes : claim.reviewNotes,
                reviewedById: req.user.id,
                resolvedDate: [shared_1.ClaimStatus.APPROVED, shared_1.ClaimStatus.REJECTED, shared_1.ClaimStatus.SETTLED].includes(newStatus)
                    ? new Date()
                    : claim.resolvedDate,
            },
            include: {
                policy: { include: { customer: true } },
            },
        });
        await (0, audit_1.logAudit)(req.user.id, 'UPDATE_CLAIM_STATUS', 'Claim', id, {
            from: currentStatus,
            to: newStatus,
            approvedAmount: input.approvedAmount,
        });
        return res.json({
            data: updated,
            message: `Claim status updated to ${newStatus}`,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getClaimTimeline(req, res, next) {
    try {
        const { id } = req.params;
        const auditLogs = await db_1.db.auditLog.findMany({
            where: { entityType: 'Claim', entityId: id },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { name: true, role: true } } },
        });
        return res.json({ data: auditLogs });
    }
    catch (err) {
        next(err);
    }
}
