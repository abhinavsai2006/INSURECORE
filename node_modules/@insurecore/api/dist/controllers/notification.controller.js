"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationRead = markNotificationRead;
const db_1 = require("../db");
async function getNotifications(req, res, next) {
    try {
        const notifications = await db_1.db.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return res.json({ data: notifications });
    }
    catch (err) {
        next(err);
    }
}
async function markNotificationRead(req, res, next) {
    try {
        const { id } = req.params;
        const notification = await db_1.db.notification.update({
            where: { id },
            data: { isRead: true },
        });
        return res.json({ data: notification });
    }
    catch (err) {
        next(err);
    }
}
