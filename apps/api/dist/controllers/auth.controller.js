"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.refresh = refresh;
exports.me = me;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const config_1 = require("../config");
const shared_1 = require("../types/shared");
const safeSignToken = (payload) => {
    const jwt = require('jsonwebtoken');
    const secret = config_1.config.jwtSecret || process.env.JWT_SECRET || 'insurecore-jwt-secret';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
};
async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({
                error: { code: 'INVALID_INPUT', message: 'Email and password are required' },
            });
        }
        const user = await db_1.db.user.findUnique({
            where: { email },
            include: { customer: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
            });
        }
        if (user.password) {
            const isMatch = await bcryptjs_1.default.compare(password, user.password).catch(() => false);
            if (!isMatch) {
                return res.status(401).json({
                    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
                });
            }
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const accessToken = safeSignToken(payload);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 3600 * 1000,
        });
        return res.status(200).json({
            data: {
                token: accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone || '+91 98765 43210',
                    avatarUrl: user.avatarUrl || null,
                    customerId: user.customer?.id || user.id,
                },
            },
            message: 'Login successful',
        });
    }
    catch (err) {
        next(err);
    }
}
async function register(req, res, next) {
    try {
        const { name, email, password, role, phone } = req.body || {};
        if (!email || !password || !name) {
            return res.status(400).json({
                error: { code: 'INVALID_INPUT', message: 'Name, email and password are required' },
            });
        }
        const existingUser = await db_1.db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                error: { code: 'EMAIL_EXISTS', message: 'User with this email already exists' },
            });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const assignedRole = role || shared_1.Role.CUSTOMER;
        const newUser = await db_1.db.user.create({
            data: {
                name,
                email,
                password: hash,
                role: assignedRole,
                phone: phone || '+91 98765 43210',
                customer: {
                    create: {
                        name,
                        email,
                        phone: phone || '+91 98765 43210',
                        kycVerified: true,
                    },
                },
            },
            include: { customer: true },
        });
        const payload = { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name };
        const accessToken = safeSignToken(payload);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 3600 * 1000,
        });
        return res.status(201).json({
            data: {
                token: accessToken,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    phone: newUser.phone,
                    customerId: newUser.customer?.id || newUser.id,
                },
            },
            message: 'Registration successful',
        });
    }
    catch (err) {
        next(err);
    }
}
async function refresh(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' } });
        }
        const jwt = require('jsonwebtoken');
        const secret = config_1.config.jwtSecret || process.env.JWT_SECRET || 'insurecore-jwt-secret';
        const payload = jwt.verify(token, secret);
        const newToken = safeSignToken({ id: payload.id, email: payload.email, role: payload.role, name: payload.name });
        res.cookie('accessToken', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 3600 * 1000,
        });
        return res.json({ data: { token: newToken }, message: 'Token refreshed' });
    }
    catch (err) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
}
async function me(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        }
        const user = await db_1.db.user.findUnique({
            where: { id: req.user.id },
            include: { customer: true },
        });
        if (!user) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        }
        return res.json({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
                customerId: user.customer?.id || null,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    res.clearCookie('accessToken');
    return res.json({ message: 'Logged out successfully' });
}
