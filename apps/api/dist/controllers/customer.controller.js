"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.createCustomer = createCustomer;
exports.getCustomerById = getCustomerById;
exports.updateCustomer = updateCustomer;
exports.getCustomerHistory = getCustomerHistory;
const db_1 = require("../db");
const shared_1 = require("../types/shared");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const audit_1 = require("../services/audit");
async function getCustomers(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        let where = {};
        if (req.user?.role === shared_1.Role.CUSTOMER) {
            if (!req.user.customerId) {
                return res.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
            }
            where.id = req.user.customerId;
        }
        else if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { city: { contains: search } },
            ];
        }
        const [total, customers] = await Promise.all([
            db_1.db.customer.count({ where }),
            db_1.db.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { policies: true, documents: true },
                    },
                },
            }),
        ]);
        return res.json({
            data: customers,
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
async function createCustomer(req, res, next) {
    try {
        const rawData = req.body;
        const payload = {
            name: rawData.name || rawData.personal?.name,
            email: rawData.email || rawData.contact?.email,
            phone: rawData.phone || rawData.contact?.phone || '+91 98765 43210',
            address: rawData.address || rawData.addressDetails?.address || 'Mumbai, Maharashtra',
            city: rawData.city || rawData.addressDetails?.city || 'Mumbai',
            state: rawData.state || rawData.addressDetails?.state || 'Maharashtra',
            pincode: rawData.pincode || rawData.addressDetails?.pincode || '400001',
            dob: rawData.dob || rawData.personal?.dob || '1992-05-15',
            gender: rawData.gender || rawData.personal?.gender || 'Male',
        };
        const input = shared_1.createCustomerSchema.parse(payload);
        const existing = await db_1.db.customer.findUnique({ where: { email: input.email } });
        if (existing) {
            return res.status(400).json({ error: { code: 'CUSTOMER_EXISTS', message: 'Customer with this email already exists' } });
        }
        const defaultPassword = await bcryptjs_1.default.hash('Password123!', 10);
        const customer = await db_1.db.customer.create({
            data: {
                name: input.name,
                email: input.email,
                phone: input.phone,
                address: input.address,
                city: input.city,
                state: input.state,
                pincode: input.pincode,
                dob: input.dob ? new Date(input.dob) : new Date('1992-05-15'),
                gender: input.gender,
                user: {
                    create: {
                        name: input.name,
                        email: input.email,
                        password: defaultPassword,
                        role: shared_1.Role.CUSTOMER,
                        phone: input.phone,
                    },
                },
            },
            include: { user: true },
        });
        if (req.user?.id) {
            await (0, audit_1.logAudit)(req.user.id, 'CREATE_CUSTOMER', 'Customer', customer.id, { name: customer.name });
        }
        return res.status(201).json({
            data: customer,
            message: 'Customer registered successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function getCustomerById(req, res, next) {
    try {
        const { id } = req.params;
        if (req.user?.role === shared_1.Role.CUSTOMER && req.user.customerId !== id) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }
        const customer = await db_1.db.customer.findUnique({
            where: { id },
            include: {
                policies: {
                    orderBy: { createdAt: 'desc' },
                    include: { claims: true, payments: true },
                },
                documents: true,
            },
        });
        if (!customer) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
        }
        return res.json({ data: customer });
    }
    catch (err) {
        next(err);
    }
}
async function updateCustomer(req, res, next) {
    try {
        const { id } = req.params;
        const { name, phone, address, city, state, pincode, kycVerified } = req.body;
        if (req.user?.role === shared_1.Role.CUSTOMER && req.user.customerId !== id) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
        }
        const updated = await db_1.db.customer.update({
            where: { id },
            data: {
                name,
                phone,
                address,
                city,
                state,
                pincode,
                kycVerified: typeof kycVerified === 'boolean' ? kycVerified : undefined,
            },
        });
        await (0, audit_1.logAudit)(req.user.id, 'UPDATE_CUSTOMER', 'Customer', id, { updatedFields: Object.keys(req.body) });
        return res.json({ data: updated, message: 'Customer updated successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function getCustomerHistory(req, res, next) {
    try {
        const { id } = req.params;
        const policies = await db_1.db.policy.findMany({
            where: { customerId: id },
            include: { claims: true, payments: true },
        });
        const documents = await db_1.db.document.findMany({
            where: { customerId: id },
        });
        return res.json({
            data: {
                policies,
                documents,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
