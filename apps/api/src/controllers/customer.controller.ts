import { Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { createCustomerSchema, Role } from '@insurecore/shared';
import bcrypt from 'bcryptjs';
import { logAudit } from '../services/audit';

export async function getCustomers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    let where: any = {};

    if (req.user?.role === Role.CUSTOMER) {
      if (!req.user.customerId) {
        return res.json({ data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
      where.id = req.user.customerId;
    } else if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const [total, customers] = await Promise.all([
      db.customer.count({ where }),
      db.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { policies: true, documents: true },
          },
        },
      }),
    ]);

    return res.json({
      data: customers,
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

export async function createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const rawData = req.body;
    const payload = {
      name: rawData.name || rawData.personal?.name || 'Customer Name',
      email: rawData.email || rawData.contact?.email || 'customer@insurecore.com',
      phone: rawData.phone || rawData.contact?.phone || '+91 98765 43210',
      address: rawData.address || rawData.addressDetails?.address || 'Mumbai, Maharashtra',
      city: rawData.city || rawData.addressDetails?.city || 'Mumbai',
      state: rawData.state || rawData.addressDetails?.state || 'Maharashtra',
      pincode: rawData.pincode || rawData.addressDetails?.pincode || '400001',
      dob: rawData.dob || rawData.personal?.dob || '1992-05-15',
      gender: rawData.gender || rawData.personal?.gender || 'Male',
    };

    const input = createCustomerSchema.parse(payload);

    const existing = await db.customer.findUnique({ where: { email: input.email } });
    if (existing) {
      return res.status(400).json({
        error: { code: 'CUSTOMER_EXISTS', message: 'Customer with this email already exists' },
      });
    }

    // Optional: create a User login for this customer with default password if needed
    const defaultPassword = await bcrypt.hash('Password123!', 12);

    const customer = await db.customer.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        dob: new Date(input.dob),
        gender: input.gender,
        user: {
          create: {
            name: input.name,
            email: input.email,
            password: defaultPassword,
            role: Role.CUSTOMER,
            phone: input.phone,
          },
        },
      },
      include: { user: true },
    });

    await logAudit(req.user!.id, 'CREATE_CUSTOMER', 'Customer', customer.id, { name: customer.name });

    return res.status(201).json({
      data: customer,
      message: 'Customer registered successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (req.user?.role === Role.CUSTOMER && req.user.customerId !== id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        policies: {
          orderBy: { createdAt: 'desc' },
          include: { claims: true, payments: true },
        },
        documents: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    return res.json({ data: customer });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, phone, address, city, state, pincode, kycVerified } = req.body;

    if (req.user?.role === Role.CUSTOMER && req.user.customerId !== id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const updated = await db.customer.update({
      where: { id },
      data: {
        name,
        phone,
        address,
        city,
        state,
        pincode,
        kycVerified: typeof kycVerified === 'boolean' ? kycVerified : undefined,
      },
    });

    await logAudit(req.user!.id, 'UPDATE_CUSTOMER', 'Customer', id, { updatedFields: Object.keys(req.body) });

    return res.json({ data: updated, message: 'Customer updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const policies = await db.policy.findMany({
      where: { customerId: id },
      include: { claims: true, payments: true },
    });

    const documents = await db.document.findMany({
      where: { customerId: id },
    });

    return res.json({
      data: {
        policies,
        documents,
      },
    });
  } catch (err) {
    next(err);
  }
}
