"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
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
        else if (req.query && req.query.token) {
            token = req.query.token;
        }
        if (!token) {
            return res.status(401).json({
                error: { code: 'UNAUTHORIZED', message: 'Authentication token required' },
            });
        }
        const jwt = require('jsonwebtoken');
        const secret = config_1.config.jwtSecret || process.env.JWT_SECRET || 'insurecore-jwt-secret';
        const payload = jwt.verify(token, secret);
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
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' },
            });
        }
        next();
    };
}
