"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    console.error('[API ERROR]', err);
    if (err instanceof zod_1.ZodError) {
        const fields = {};
        err.errors.forEach((e) => {
            if (e.path.length > 0) {
                fields[e.path.join('.')] = e.message;
            }
        });
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request parameters',
                fields,
            },
        });
    }
    if (err.status) {
        return res.status(err.status).json({
            error: {
                code: err.code || 'HTTP_ERROR',
                message: err.message,
            },
        });
    }
    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected error occurred',
        },
    });
}
