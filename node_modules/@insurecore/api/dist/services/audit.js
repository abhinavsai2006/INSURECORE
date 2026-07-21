"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const db_1 = require("../db");
async function logAudit(userId, action, entityType, entityId, metadata) {
    try {
        await db_1.db.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });
    }
    catch (err) {
        console.error('Audit log failed:', err);
    }
}
