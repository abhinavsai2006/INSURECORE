import { Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await db.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ data: notification });
  } catch (err) {
    next(err);
  }
}
