import { Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import { logAudit } from '../services/audit';

export async function uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'No document file attached' } });
    }

    const { customerId, policyId, claimId, docCategory } = req.body;

    const doc = await db.document.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileType: req.file.mimetype,
        fileSizeKb: Math.round(req.file.size / 1024),
        docCategory: docCategory || 'OTHER',
        customerId: customerId || req.user?.customerId || null,
        policyId: policyId || null,
        claimId: claimId || null,
      },
    });

    await logAudit(req.user!.id, 'UPLOAD_DOCUMENT', 'Document', doc.id, { fileName: doc.fileName });

    return res.status(201).json({
      data: doc,
      message: 'Document uploaded successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getDocuments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { category, customerId } = req.query;
    let where: any = {};

    if (req.user?.role === 'CUSTOMER') {
      if (!req.user.customerId) return res.json({ data: [] });
      where.customerId = req.user.customerId;
    } else if (customerId) {
      where.customerId = customerId as string;
    }

    if (category) where.docCategory = category as string;

    const documents = await db.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        policy: { select: { id: true, policyNumber: true } },
        claim: { select: { id: true, claimNumber: true } },
      },
    });

    return res.json({ data: documents });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const doc = await db.document.findUnique({ where: { id } });

    if (!doc) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const fullPath = path.resolve(__dirname, '../../../uploads', doc.filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: { code: 'FILE_MISSING', message: 'File missing on server' } });
    }

    return res.sendFile(fullPath);
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const doc = await db.document.findUnique({ where: { id } });

    if (!doc) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const fullPath = path.resolve(__dirname, '../../../uploads', doc.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await db.document.delete({ where: { id } });
    await logAudit(req.user!.id, 'DELETE_DOCUMENT', 'Document', id);

    return res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
}
