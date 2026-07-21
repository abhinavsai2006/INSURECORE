import { db } from '../db';

export async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: any
) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
