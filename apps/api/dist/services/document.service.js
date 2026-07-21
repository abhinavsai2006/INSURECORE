"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const db_1 = require("../db");
const audit_1 = require("./audit");
exports.documentService = {
    // Upload a new document
    upload: async (data, userId) => {
        const document = await db_1.db.document.create({
            data: {
                ...data,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'DOCUMENT_UPLOADED', 'Document', document.id, {
            fileName: document.fileName,
            docCategory: document.docCategory,
            customerId: document.customerId,
            policyId: document.policyId,
            claimId: document.claimId
        });
        return document;
    },
    // Find a document by ID
    findById: async (id) => {
        return db_1.db.document.findUnique({
            where: { id },
            include: {
                customer: true,
                policy: true,
                claim: true,
            }
        });
    },
    // Get documents with filtering and pagination
    findMany: async (params) => {
        const { skip, take, cursor, where, orderBy } = params;
        return db_1.db.document.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                customer: true,
                policy: true,
                claim: true,
            }
        });
    },
    // Update a document
    update: async (params) => {
        const { where, data } = params;
        return db_1.db.document.update({ where, data });
    },
    // Delete a document
    delete: async (where, userId) => {
        // Get document before deleting for audit
        const document = await db_1.db.document.findUnique({
            where: { id: where.id },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        await db_1.db.document.delete({ where });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'DOCUMENT_DELETED', 'Document', where.id, {
            fileName: document?.fileName,
            docCategory: document?.docCategory
        });
        return true; // Indicate success
    },
    // Get documents by category
    getByCategory: async (category) => {
        return db_1.db.document.findMany({
            where: { docCategory: category },
            include: {
                customer: true,
                policy: true,
                claim: true,
            },
            orderBy: { uploadedAt: 'desc' }
        });
    },
    // Get documents for a customer
    getByCustomerId: async (customerId) => {
        return db_1.db.document.findMany({
            where: { customerId },
            include: {
                policy: true,
                claim: true,
            },
            orderBy: { uploadedAt: 'desc' }
        });
    },
    // Get documents for a policy
    getByPolicyId: async (policyId) => {
        return db_1.db.document.findMany({
            where: { policyId },
            include: {
                customer: true,
                claim: true,
            },
            orderBy: { uploadedAt: 'desc' }
        });
    },
    // Get documents for a claim
    getByClaimId: async (claimId) => {
        return db_1.db.document.findMany({
            where: { claimId },
            include: {
                customer: true,
                policy: true,
            },
            orderBy: { uploadedAt: 'desc' }
        });
    },
    // Get document statistics
    getStatistics: async () => {
        const [total, byCategory] = await Promise.all([
            db_1.db.document.count(),
            db_1.db.document.groupBy({
                by: ['docCategory'],
                _count: true,
            }),
        ]);
        const categoryCounts = byCategory.reduce((acc, item) => {
            acc[item.docCategory] = item._count;
            return acc;
        }, {});
        return {
            total,
            byCategory: categoryCounts,
        };
    },
    // Get recent documents
    getRecent: async (limit = 10) => {
        return db_1.db.document.findMany({
            take: limit,
            include: {
                customer: { select: { name: true, email: true } },
                policy: { select: { policyNumber: true } },
                claim: { select: { claimNumber: true } }
            },
            orderBy: { uploadedAt: 'desc' }
        });
    }
};
