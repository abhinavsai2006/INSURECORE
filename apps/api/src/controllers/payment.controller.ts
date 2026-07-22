import { Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createPaymentSchema, PaymentStatus, PolicyStatus, Role } from '../types/shared';
import { logAudit } from '../services/audit';
import { generatePaymentReceiptPDF } from '../services/pdf';

export async function getPayments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = (req.query.search as string) || '';

    let where: any = {};

    if (req.user?.role === Role.CUSTOMER) {
      if (!req.user.customerId) return res.json({ data: [] });
      where.policy = { customerId: req.user.customerId };
    }

    if (status) where.paymentStatus = status;

    if (search) {
      where.OR = [
        { transactionRef: { contains: search } },
        { policy: { policyNumber: { contains: search } } },
        { policy: { customer: { name: { contains: search } } } },
      ];
    }

    const [total, payments] = await Promise.all([
      db.payment.count({ where }),
      db.payment.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { dueDate: 'desc' },
        include: {
          policy: {
            include: {
              customer: { select: { name: true, email: true } },
            },
          },
        },
      }),
    ]);

    return res.json({
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = createPaymentSchema.parse(req.body);
    const transactionRef = input.transactionRef || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await db.payment.create({
      data: {
        policyId: input.policyId,
        amount: input.amount,
        dueDate: new Date(),
        paymentDate: new Date(),
        paymentStatus: PaymentStatus.PAID,
        method: input.method,
        transactionRef,
      },
      include: {
        policy: { include: { customer: true } },
      },
    });

    // Automatically update Policy status to ACTIVE on successful payment
    await db.policy.update({
      where: { id: input.policyId },
      data: { status: PolicyStatus.ACTIVE },
    }).catch((e: any) => console.warn('Policy status update warning:', e));

    if (req.user?.id) {
      await logAudit(req.user.id, 'CREATE_PAYMENT', 'Payment', payment.id, {
        amount: input.amount,
        transactionRef,
      });
    }

    return res.status(201).json({
      data: payment,
      message: 'Payment recorded successfully and policy activated',
    });
  } catch (err) {
    next(err);
  }
}

export async function getOverduePayments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payments = await db.payment.findMany({
      where: {
        paymentStatus: PaymentStatus.OVERDUE,
      },
      include: {
        policy: { include: { customer: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return res.json({ data: payments });
  } catch (err) {
    next(err);
  }
}

export async function markPaid(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { method, transactionRef } = req.body;

    const payment = await db.payment.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentDate: new Date(),
        method: method || 'CARD',
        transactionRef: transactionRef || `TXN-${Date.now()}`,
      },
      include: { policy: { include: { customer: true } } },
    });

    await logAudit(req.user!.id, 'MARK_PAYMENT_PAID', 'Payment', id);

    return res.json({ data: payment, message: 'Payment marked as PAID' });
  } catch (err) {
    next(err);
  }
}

export async function downloadReceiptPDF(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const payment = await db.payment.findUnique({
      where: { id },
      include: { policy: { include: { customer: true } } },
    });

    if (!payment) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } });
    }

    const pdfBuffer = await generatePaymentReceiptPDF(payment);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Receipt-${payment.id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}
