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
exports.userService = void 0;
const db_1 = require("../db");
const bcrypt = __importStar(require("bcryptjs"));
const audit_1 = require("./audit");
exports.userService = {
    // Create a new user (admin/agent)
    create: async (data, userId) => {
        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 12);
        const user = await db_1.db.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'USER_CREATED', 'User', user.id, {
            email: user.email,
            role: user.role
        });
        return user;
    },
    // Find a user by ID
    findById: async (id) => {
        return db_1.db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                customer: true, // Include customer if it exists
            }
        });
    },
    // Find a user by email
    findByEmail: async (email) => {
        return db_1.db.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: true, // Include password for authentication
                phone: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                customer: true,
            }
        });
    },
    // Get users with filtering and pagination
    findMany: async (params) => {
        const { skip, take, cursor, where, orderBy } = params;
        return db_1.db.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    },
    // Update a user
    update: async (params) => {
        const { where, data } = params;
        // Hash password if it's being updated
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 12);
        }
        const user = await db_1.db.user.update({ where, data });
        // Log audit (note: we'd need the userId performing the update, but it's not passed here)
        // This would typically be handled in the controller
        return user;
    },
    // Delete a user (soft delete by setting isActive to false)
    delete: async (where, userId) => {
        // Get user before updating for audit
        const user = await db_1.db.user.findUnique({
            where: { id: where.id },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const updatedUser = await db_1.db.user.update({
            where,
            data: { isActive: false },
        });
        // Log audit
        await (0, audit_1.logAudit)(userId, 'USER_DELETED', 'User', where.id, {
            email: user.email,
            role: user.role
        });
        return updatedUser;
    },
    // Update user role
    updateRole: async (params) => {
        const { where, role, userId: updaterId } = params;
        // Get user before updating for audit
        const user = await db_1.db.user.findUnique({
            where: { id: where.id },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const updatedUser = await db_1.db.user.update({
            where,
            data: { role },
        });
        // Log audit
        await (0, audit_1.logAudit)(updaterId, 'USER_ROLE_UPDATED', 'User', where.id, {
            previousRole: user.role,
            newRole: role
        });
        return updatedUser;
    },
    // Get user statistics
    getStatistics: async () => {
        const [total, byRole, activeCount] = await Promise.all([
            db_1.db.user.count(),
            db_1.db.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            db_1.db.user.count({ where: { isActive: true } })
        ]);
        const roleCounts = byRole.reduce((acc, item) => {
            acc[item.role] = item._count;
            return acc;
        }, {});
        return {
            total,
            active: activeCount,
            inactive: total - activeCount,
            byRole: roleCounts
        };
    },
    // Deactivate inactive users (could be called by cron)
    deactivateInactive: async (daysInactive = 365) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
        const users = await db_1.db.user.updateMany({
            where: {
                isActive: true,
                updatedAt: {
                    lt: cutoffDate,
                },
            },
            data: { isActive: false },
        });
        return users.count;
    }
};
