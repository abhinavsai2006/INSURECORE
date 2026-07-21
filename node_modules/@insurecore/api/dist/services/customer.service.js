"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = exports.customer = void 0;
const db_1 = require("../db");
const audit_1 = require("./audit");
const bcrypt = __importStar(require("bcryptjs"));
';;
string;
email;
string;
phone;
string;
address;
string;
city;
string | null;
state;
string | null;
pincode;
string | null;
dob;
Date;
gender;
string | null;
exports.customerService = {
    // Create a new customer with associated user account
    create: async (data, userId) => {
        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 12);
        // Create the user and customer in a transaction
        const result = await db_1.db.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    name: data.name,
                    role: 'CUSTOMER',
                    phone: data.phone,
                },
            });
            // Create customer linked to user
            const customer = await tx.customer.create({
                data: {
                    userId: user.id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    dob: data.dob,
                    gender: data.gender,
                    kycVerified: false,
                },
            });
            // Link customer to user
            await tx.user.update({
                where: { id: user.id },
                data: { customer: { connect: { id: customer.id } } },
            });
            return { user, customer };
        });
        // Log audit
        if (userId) {
            await (0, audit_1.logAudit)(userId, 'CUSTOMER_CREATED', 'Customer', result.customer.id, {
                email: result.customer.email,
            });
        }
        return result.customer;
    },
    // Find a customer by ID
    findById: async (id) => {
        return db_1.db.customer.findUnique({
            where: { id },
            include: {
                user: true,
                policies: true,
                documents: true,
            },
        });
    },
    // Find a customer by user ID
    findByUserId: async (userId) => {
        return db_1.db.customer.findUnique({
            where: { userId },
            include: {
                user: true,
                policies: true,
                documents: true,
            },
        });
    },
    // Get customers with filtering and pagination
    findMany: async (params) => {
        const { skip, take, cursor, where, orderBy } = params;
        return db_1.db.customer.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: { user: true },
        });
    },
    // Update a customer
    update: async (params) => {
        const { where, data } = params;
        return db_1.db.customer.update({ where, data });
    },
    // Delete a customer
    delete: async (where) => {
        return db_1.db.customer.delete({ where });
    },
    // Verify KYC for a customer
    verifyKyc: async (customerId, userId) => {
        const customer = await db_1.db.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new Error('Customer not found');
        }
        const updatedCustomer = await db_1.db.customer.update({
            where: { id: customerId },
            data: { kycVerified: true },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'KYC_VERIFIED', 'Customer', customerId, {
            previousKycStatus: customer.kycVerified,
            newKycStatus: true
        });
        return updatedCustomer;
    },
    // Get customer statistics
    getStatistics: async () => {
        const [total, withPolicies, verifiedKyc] = await Promise.all([
            db_1.db.customer.count(),
            db_1.db.customer.count({ where: { policies: { some: {} } } }),
            db_1.db.customer.count({ where: { kycVerified: true } }),
        ]);
        return {
            total,
            withPolicies,
            verifiedKyc,
            withoutPolicies: total - withPolicies,
            unverifiedKyc: total - verifiedKyc,
        };
    },
    // Get customer history (policies, claims, payments, documents)
    getHistory: async (customerId) => {
        const [policies, claims, payments, documents] = await Promise.all([
            db_1.db.policy.findMany({
                where: { customerId },
                include: {
                    claims: true,
                    payments: true,
                    documents: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            db_1.db.claim.findMany({
                where: { policy: { customerId } },
                include: { policy: true, documents: true },
                orderBy: { submissionDate: 'desc' }
            }),
            db_1.db.payment.findMany({
                where: { policy: { customerId } },
                include: { policy: true },
                orderBy: { createdAt: 'desc' }
            }),
            db_1.db.document.findMany({
                where: { customerId },
                orderBy: { uploadedAt: 'desc' }
            }),
        ]);
        return {
            policies,
            claims,
            payments,
            documents,
        };
    },
};
