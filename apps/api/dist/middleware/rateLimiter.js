"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: {
            message: 'Too many requests from this IP, please try again after 15 minutes.',
            code: 'RATE_LIMIT_EXCEEDED'
        }
    }
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 requests per `window` (here, per 1 hour) for auth endpoints
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            message: 'Too many login attempts from this IP, please try again after an hour.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED'
        }
    }
});
