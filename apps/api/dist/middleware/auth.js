"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const db_1 = require("../db");
async function authenticate(req, res, next) {
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
            return res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'Authentication token missing' },
            });
        }
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = await db_1.db.user.findUnique({
            where: { id: payload.id },
            include: { customer: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'User account not active or found' },
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            customerId: user.customer?.id || null,
        };
        next();
    }
    catch (err) {
        return res.status(401).json({
            error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' },
        });
    }
}
function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource' },
            });
        }
        next();
    };
}
