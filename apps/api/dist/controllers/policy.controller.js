"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicies = getPolicies;
exports.createPolicy = createPolicy;
exports.getPolicyById = getPolicyById;
exports.renewPolicy = renewPolicy;
exports.cancelPolicy = cancelPolicy;
exports.getExpiringPolicies = getExpiringPolicies;
exports.downloadPolicyPDF = downloadPolicyPDF;
exports.downloadTaxCertificatePDF = downloadTaxCertificatePDF;
exports.downloadHealthCardPDF = downloadHealthCardPDF;
const db_1 = require("../db");
const shared_1 = require("../types/shared");
const audit_1 = require("../services/audit");
const pdf_1 = require("../services/pdf");
async function getPolicies(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status;
        const policyType = req.query.policyType;
        const conditions = [];
        if (req.user?.role === shared_1.Role.CUSTOMER) {
            if (!req.user.customerId) {
                return res.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }
            conditions.push({ customerId: req.user.customerId });
        }
        else if (req.user?.role === shared_1.Role.AGENT) {
            conditions.push({ agentId: req.user.id });
        }
        if (status)
            conditions.push({ status });
        if (policyType)
            conditions.push({ policyType });
        if (search) {
            conditions.push({
                OR: [
                    { policyNumber: { contains: search } },
                    { planName: { contains: search } },
                ],
            });
        }
        const where = conditions.length > 0 ? { AND: conditions } : {};
        const [total, policies] = await Promise.all([
            db_1.db.policy.count({ where }),
            db_1.db.policy.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { id: true, name: true, email: true, phone: true } },
                    agent: { select: { id: true, name: true, email: true } },
                    _count: { select: { claims: true, payments: true } },
                },
            }),
        ]);
        return res.json({
            data: policies,
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
async function createPolicy(req, res, next) {
    try {
        let customerId = req.body.customerId;
        if (!customerId && req.user?.customerId) {
            customerId = req.user.customerId;
        }
        if (customerId) {
            const exists = await db_1.db.customer.findUnique({ where: { id: customerId } });
            if (!exists) {
                customerId = undefined;
            }
        }
        if (!customerId && req.user?.id) {
            let customer = await db_1.db.customer.findFirst({ where: { userId: req.user.id } });
            if (!customer) {
                customer = await db_1.db.customer.findFirst({ where: { email: req.user.email } });
            }
            if (!customer) {
                customer = await db_1.db.customer.create({
                    data: {
                        userId: req.user.id,
                        name: req.user.name || 'Policyholder',
                        email: req.user.email,
                        phone: '9999999999',
                        address: 'Main Office / Corporate Address',
                        dob: new Date('1990-01-01'),
                        kycVerified: true,
                    },
                });
            }
            customerId = customer.id;
        }
        if (!customerId) {
            const firstCustomer = await db_1.db.customer.findFirst();
            if (firstCustomer) {
                customerId = firstCustomer.id;
            }
            else {
                const newCust = await db_1.db.customer.create({
                    data: {
                        name: 'Default Policyholder',
                        email: `customer_${Date.now()}@insurecore.com`,
                        phone: '9876543210',
                        address: 'Corporate Headquarters',
                        dob: new Date('1992-01-01'),
                        kycVerified: true,
                    },
                });
                customerId = newCust.id;
            }
        }
        const payload = {
            ...req.body,
            customerId,
        };
        const input = shared_1.createPolicySchema.parse(payload);
        const count = await db_1.db.policy.count();
        const year = new Date().getFullYear();
        const seq = String(count + 1).padStart(6, '0');
        const policyNumber = `POL-${year}-${seq}`;
        // Get or assign real customerId
        let targetCustomerId = input.customerId;
        if (!targetCustomerId) {
            if (req.user?.customerId) {
                targetCustomerId = req.user.customerId;
            }
            else {
                const firstCust = await db_1.db.customer.findFirst();
                targetCustomerId = firstCust?.id;
            }
        }
        if (!targetCustomerId) {
            return res.status(400).json({ error: { code: 'CUSTOMER_REQUIRED', message: 'Valid customer is required for policy issuance' } });
        }
        const policy = await db_1.db.policy.create({
            data: {
                policyNumber,
                customerId: targetCustomerId,
                agentId: input.agentId || (req.user?.role === shared_1.Role.AGENT ? req.user.id : null),
                policyType: input.policyType || 'HEALTH',
                planName: input.planName || 'Comprehensive Health Shield',
                sumInsured: input.sumInsured || 250000,
                premiumAmount: input.premiumAmount || 1450,
                premiumFrequency: input.premiumFrequency || 'YEARLY',
                startDate: input.startDate ? new Date(input.startDate) : new Date(),
                endDate: input.endDate ? new Date(input.endDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
                status: shared_1.PolicyStatus.ACTIVE,
                nominee: input.nominee,
                payments: {
                    create: {
                        amount: input.premiumAmount || 1450,
                        dueDate: input.startDate ? new Date(input.startDate) : new Date(),
                        paymentDate: new Date(),
                        paymentStatus: shared_1.PaymentStatus.PAID,
                        method: 'CARD',
                        transactionRef: `TXN-POL-${Date.now()}`,
                    },
                },
            },
            include: {
                customer: true,
                agent: true,
                payments: true,
            },
        });
        if (req.user?.id) {
            await (0, audit_1.logAudit)(req.user.id, 'CREATE_POLICY', 'Policy', policy.id, { policyNumber });
        }
        return res.status(201).json({
            data: policy,
            message: `Policy ${policyNumber} issued successfully`,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getPolicyById(req, res, next) {
    try {
        const { id } = req.params;
        const policy = await db_1.db.policy.findUnique({
            where: { id },
            include: {
                customer: true,
                agent: { select: { id: true, name: true, email: true, phone: true } },
                claims: { orderBy: { submissionDate: 'desc' } },
                payments: { orderBy: { dueDate: 'desc' } },
                documents: true,
            },
        });
        if (!policy) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
        }
        if (req.user?.role === shared_1.Role.CUSTOMER && req.user.customerId !== policy.customerId) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }
        return res.json({ data: policy });
    }
    catch (err) {
        next(err);
    }
}
async function renewPolicy(req, res, next) {
    try {
        const { id } = req.params;
        const policy = await db_1.db.policy.findUnique({ where: { id } });
        if (!policy) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
        }
        const currentEndDate = new Date(policy.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        const renewed = await db_1.db.policy.update({
            where: { id },
            data: {
                endDate: newEndDate,
                status: shared_1.PolicyStatus.ACTIVE,
                payments: {
                    create: {
                        amount: policy.premiumAmount,
                        dueDate: currentEndDate,
                        paymentStatus: 'PENDING',
                    },
                },
            },
            include: { payments: true },
        });
        await (0, audit_1.logAudit)(req.user.id, 'RENEW_POLICY', 'Policy', id, { newEndDate });
        return res.json({ data: renewed, message: 'Policy renewed successfully for 1 year' });
    }
    catch (err) {
        next(err);
    }
}
async function cancelPolicy(req, res, next) {
    try {
        const { id } = req.params;
        const cancelled = await db_1.db.policy.update({
            where: { id },
            data: { status: shared_1.PolicyStatus.CANCELLED },
        });
        await (0, audit_1.logAudit)(req.user.id, 'CANCEL_POLICY', 'Policy', id);
        return res.json({ data: cancelled, message: 'Policy cancelled' });
    }
    catch (err) {
        next(err);
    }
}
async function getExpiringPolicies(req, res, next) {
    try {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const policies = await db_1.db.policy.findMany({
            where: {
                endDate: { lte: thirtyDaysFromNow },
                status: { in: [shared_1.PolicyStatus.ACTIVE, shared_1.PolicyStatus.RENEWAL_DUE] },
            },
            take: 10,
            orderBy: { endDate: 'asc' },
            include: { customer: true },
        });
        return res.json({ data: policies });
    }
    catch (err) {
        next(err);
    }
}
async function downloadPolicyPDF(req, res, next) {
    try {
        const { id } = req.params;
        const policy = await db_1.db.policy.findUnique({
            where: { id },
            include: { customer: true, agent: true },
        });
        if (!policy) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
        }
        const pdfBuffer = await (0, pdf_1.generatePolicyPDF)(policy);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${policy.policyNumber}.pdf"`);
        return res.send(pdfBuffer);
    }
    catch (err) {
        next(err);
    }
}
async function downloadTaxCertificatePDF(req, res, next) {
    try {
        const { id } = req.params;
        const policy = await db_1.db.policy.findUnique({ where: { id }, include: { customer: true } });
        if (!policy)
            return res.status(404).json({ error: { message: 'Policy not found' } });
        const buffer = await (0, pdf_1.generateTaxCertificatePDF)(policy);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Section80D_Certificate_${policy.policyNumber}.pdf"`);
        return res.send(buffer);
    }
    catch (err) {
        next(err);
    }
}
async function downloadHealthCardPDF(req, res, next) {
    try {
        const { id } = req.params;
        const policy = await db_1.db.policy.findUnique({ where: { id }, include: { customer: true } });
        if (!policy)
            return res.status(404).json({ error: { message: 'Policy not found' } });
        const buffer = await (0, pdf_1.generateHealthCardPDF)(policy);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="HealthSmartCard_${policy.policyNumber}.pdf"`);
        return res.send(buffer);
    }
    catch (err) {
        next(err);
    }
}
