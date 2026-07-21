"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.createUser = createUser;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.toggleUserActive = toggleUserActive;
const db_1 = require("../db");
const shared_1 = require("@insurecore/shared");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const audit_1 = require("../services/audit");
async function getUsers(req, res, next) {
    try {
        const role = req.query.role;
        let where = {};
        if (role)
            where.role = role;
        const users = await db_1.db.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
                _count: { select: { agentPolicies: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ data: users });
    }
    catch (err) {
        next(err);
    }
}
async function createUser(req, res, next) {
    try {
        const input = shared_1.createAgentSchema.parse(req.body);
        const { role } = req.body;
        const existing = await db_1.db.user.findUnique({ where: { email: input.email } });
        if (existing) {
            return res.status(400).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already in use' } });
        }
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
        const user = await db_1.db.user.create({
            data: {
                name: input.name,
                email: input.email,
                password: hashedPassword,
                role: role || shared_1.Role.AGENT,
                phone: input.phone,
            },
        });
        await (0, audit_1.logAudit)(req.user.id, 'CREATE_USER', 'User', user.id, { role: user.role, name: user.name });
        return res.status(201).json({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
            message: `${user.role} user created successfully`,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getUserById(req, res, next) {
    try {
        const { id } = req.params;
        const user = await db_1.db.user.findUnique({
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
                customer: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
        return res.json({ data: user });
    }
    catch (err) {
        next(err);
    }
}
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const data = req.body;
        // Check if user exists
        const existingUser = await db_1.db.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
        // Prevent users from modifying their own role or making themselves admin
        if (data.role && req.user?.id === id && data.role !== req.user?.role) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Cannot change your own role' }
            });
        }
        // Only admins can change roles of others
        if (data.role && req.user?.role !== 'ADMIN' && req.user?.id !== id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Only admins can change user roles' }
            });
        }
        // Hash password if provided
        if (data.password) {
            data.password = await bcryptjs_1.default.hash(data.password, 12);
        }
        const user = await db_1.db.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                phone: data.phone,
            },
        });
        await (0, audit_1.logAudit)(req.user.id, 'UPDATE_USER', 'User', id, {
            changes: Object.keys(data).filter(key => data[key] !== undefined)
        });
        return res.json({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
            message: 'User updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        // Check if user exists
        const user = await db_1.db.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
        // Prevent users from deleting themselves
        if (req.user?.id === id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Cannot delete your own account' }
            });
        }
        // Only admins can delete users
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Only admins can delete users' }
            });
        }
        // Soft delete by setting isActive to false
        await db_1.db.user.update({
            where: { id },
            data: { isActive: false },
        });
        await (0, audit_1.logAudit)(req.user.id, 'DELETE_USER', 'User', id, {
            email: user.email,
            role: user.role
        });
        return res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function toggleUserActive(req, res, next) {
    try {
        const { id } = req.params;
        const user = await db_1.db.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
        const updated = await db_1.db.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
        await (0, audit_1.logAudit)(req.user.id, 'TOGGLE_USER_ACTIVE', 'User', id, { isActive: updated.isActive });
        return res.json({ data: updated, message: `User status set to ${updated.isActive ? 'Active' : 'Inactive'}` });
    }
    catch (err) {
        next(err);
    }
}
