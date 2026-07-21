"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const db_1 = require("../db");
const audit_1 = require("./audit");
exports.paymentService = {
    // Create a new payment
    create: async (data, userId) => {
        // Check for idempotency
        if (data.idempotencyKey) {
            const existingPayment = await db_1.db.payment.findFirst({
                where: { idempotencyKey: data.idempotencyKey }
            });
            if (existingPayment) {
                return existingPayment;
            }
        }
        const payment = await db_1.db.payment.create({
            data: {
                ...data,
                // Remove idempotencyKey from data since it's handled separately
                idempotencyKey: data.idempotencyKey ?? undefined,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'PAYMENT_CREATED', 'Payment', payment.id, {
            policyId: payment.policyId,
            amount: payment.amount,
            idempotencyKey: data.idempotencyKey
        });
        return payment;
    },
    // Find a payment by ID
    findById: async (id) => {
        return db_1.db.payment.findUnique({
            where: { id },
            include: {
                policy: {
                    include: { customer: true }
                }
            }
        });
    },
    // Get payments with filtering and pagination
    findMany: async (params) => {
        const { skip, take, cursor, where, orderBy } = params;
        return db_1.db.payment.findMany({
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
    // Update a payment
    update: async (params) => {
        const { where, data } = params;
        return db_1.db.payment.update({ where, data });
    },
    // Delete a payment
    delete: async (where) => {
        return db_1.db.payment.delete({ where });
    },
    // Mark a payment as paid
    markAsPaid: async (paymentId, userId, transactionRef) => {
        const payment = await db_1.db.payment.findUnique({
            where: { id: paymentId },
            include: { policy: true }
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        if (payment.paymentStatus === 'PAID') {
            throw new Error('Payment is already marked as paid');
        }
        const updatedPayment = await db_1.db.payment.update({
            where: { id: paymentId },
            data: {
                paymentStatus: 'PAID',
                paymentDate: new Date(),
                transactionRef: transactionRef ?? undefined,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'PAYMENT_MARKED_PAID', 'Payment', paymentId, {
            previousStatus: payment.paymentStatus,
            newStatus: 'PAID',
            transactionRef
        });
        return updatedPayment;
    },
    // Get payments by status
    getByStatus: async (status) => {
        return db_1.db.payment.findMany({
            where: { paymentStatus: status },
            include: {
                policy: {
                    include: { customer: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },
    // Get overdue payments
    getOverdue: async () => {
        const now = new Date();
        return db_1.db.payment.findMany({
            where: {
                paymentStatus: 'PENDING',
                dueDate: {
                    lt: now,
                },
            },
            include: {
                policy: {
                    include: { customer: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        });
    },
    // Get payment statistics
    getStatistics: async () => {
        const [total, byStatus, totalAmount] = await Promise.all([
            db_1.db.payment.count(),
            db_1.db.payment.groupBy({
                by: ['paymentStatus'],
                _count: true,
                _sum: {
                    amount: true,
                },
            }),
            db_1.db.payment.aggregate({
                _sum: {
                    amount: true,
                },
            }),
        ]);
        const statusCounts = byStatus.reduce((acc, item) => {
            acc[item.paymentStatus] = {
                count: item._count,
                totalAmount: item._sum.amount || 0
            };
            return acc;
        }, {});
        return {
            total,
            totalAmount: totalAmount._sum.amount || 0,
            byStatus: statusCounts,
        };
    },
    // Process overdue payments (called by cron job)
    processOverduePayments: async () => {
        const overduePayments = await exports.paymentService.getOverdue();
        // Update payments to OVERDUE status
        const updatedPayments = await Promise.all(overduePayments.map(payment => db_1.db.payment.update({
            where: { id: payment.id },
            data: { paymentStatus: 'OVERDUE' },
        })));
        return updatedPayments;
    },
    // Get payments for a specific policy
    getByPolicyId: async (policyId) => {
        return db_1.db.payment.findMany({
            where: { policyId },
            include: {
                policy: {
                    include: { customer: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        });
    }
};
