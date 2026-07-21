"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRateLimit = exports.apiRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General rate limiter
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.'
        }
    }
});
// Auth-specific rate limiter (more strict)
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 login attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts from this IP, please try again after 1 minute.'
        }
    }
});
// API rate limiter (for authenticated routes)
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'API_RATE_LIMIT_EXCEEDED',
            message: 'Too many API requests, please try again later.'
        }
    }
});
// Export a function to apply rate limiting based on route
const applyRateLimit = (type) => {
    switch (type) {
        case 'auth':
            return exports.authRateLimiter;
        case 'api':
            return exports.apiRateLimiter;
        default:
            return exports.generalRateLimiter;
    }
};
exports.applyRateLimit = applyRateLimit;
