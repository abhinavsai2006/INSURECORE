import { Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export async function createQuote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { customerId, policyType, planName, sumInsured } = req.body;

    const baseRates: Record<string, number> = {
      HEALTH: 14500,
      MOTOR: 8900,
      LIFE: 21000,
      TRAVEL: 3200,
      HOME: 6500,
    };

    const base = baseRates[policyType] || 12000;
    const multiplier = (sumInsured || 500000) / 500000;
    const basePremium = Math.round(base * multiplier);
    const gstAmount = Math.round(basePremium * 0.18);
    const totalPremium = basePremium + gstAmount;

    const quoteNumber = `QT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const quote = await db.quote.create({
      data: {
        quoteNumber,
        customerId: customerId || req.user?.customerId || 'demo-customer',
        policyType: policyType || 'HEALTH',
        planName: planName || 'Comprehensive Health Shield',
        sumInsured: Number(sumInsured) || 1000000,
        basePremium,
        gstAmount,
        totalPremium,
        status: 'GENERATED',
      },
    });

    return res.status(201).json({
      data: quote,
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuoteById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const quote = await db.quote.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!quote) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    return res.json({ data: quote });
  } catch (err) {
    next(err);
  }
}
