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
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const config_1 = require("../config");
const shared_1 = require("@insurecore/shared");
const audit_1 = require("../services/audit");
async function login(req, res, next) {
    try {
        const input = shared_1.loginSchema.parse(req.body);
        const user = await db_1.db.user.findUnique({
            where: { email: input.email },
            include: { customer: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
            });
        }
        const isMatch = await bcryptjs_1.default.compare(input.password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
            });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtRefreshSecret, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        await (0, audit_1.logAudit)(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email });
        return res.json({
            data: {
                token: accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatarUrl: user.avatarUrl,
                    customerId: user.customer?.id || null,
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
        const input = shared_1.registerSchema.parse(req.body);
        const existing = await db_1.db.user.findUnique({ where: { email: input.email } });
        if (existing) {
            return res.status(400).json({
                error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' },
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
        const user = await db_1.db.user.create({
            data: {
                name: input.name,
                email: input.email,
                password: hashedPassword,
                role: shared_1.Role.CUSTOMER,
                phone: input.phone,
                customer: {
                    create: {
                        name: input.name,
                        email: input.email,
                        phone: input.phone,
                        address: input.address,
                        city: input.city,
                        state: input.state,
                        pincode: input.pincode,
                        dob: new Date(input.dob),
                        gender: input.gender,
                        kycVerified: false,
                    },
                },
            },
            include: { customer: true },
        });
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtRefreshSecret, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        await (0, audit_1.logAudit)(user.id, 'USER_REGISTER', 'User', user.id, { email: user.email });
        return res.status(201).json({
            data: {
                token: accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    customerId: user.customer?.id || null,
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
        const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
        if (!refreshToken) {
            return res.status(401).json({
                error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token is required' },
            });
        }
        const payload = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwtRefreshSecret);
        const user = await db_1.db.user.findUnique({
            where: { id: payload.id },
            include: { customer: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: { code: 'INVALID_TOKEN', message: 'User account not active or found' },
            });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, config_1.config.jwtSecret, { expiresIn: '15m' });
        return res.json({
            data: {
                token: newAccessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    customerId: user.customer?.id || null,
                },
            },
            message: 'Token refreshed',
        });
    }
    catch (err) {
        return res.status(401).json({
            error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
        });
    }
}
async function me(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        }
        const user = await db_1.db.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                customer: true,
            },
        });
        return res.json({ data: user });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res) {
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
}
// Forgot password endpoint (mock implementation)
async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        // In a real app, you would:
        // 1. Check if the email exists
        // 2. Generate a reset token
        // 3. Save the token to the database with expiry
        // 4. Send an email with the reset link
        // For now, we'll just return a success message (don't reveal if email exists or not for security)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return res.json({
            message: 'If an account with that email exists, you will receive a password reset link.'
        });
    }
    catch (err) {
        next(err);
    }
}
// Reset password endpoint (mock implementation)
async function resetPassword(req, res, next) {
    try {
        const { token, password } = req.body;
        // In a real app, you would:
        // 1. Validate the token
        // 2. Find the user associated with the token
        // 3. Update the user's password
        // 4. Invalidate the token
        // For now, we'll just return a success message
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return res.json({
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });
    }
    catch (err) {
        next(err);
    }
}
