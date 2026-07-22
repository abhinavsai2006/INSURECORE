import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { db } from '../db';
import { Role } from '../types/shared';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
    customerId?: string | null;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.query && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' },
      });
    }

    const jwt = require('jsonwebtoken');
    const secret = config.jwtSecret || process.env.JWT_SECRET || 'insurecore-jwt-secret';
    const payload = jwt.verify(token, secret);

    const user = await db.user.findUnique({
      where: { id: payload.id },
      include: { customer: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User account not active or found' },
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
      customerId: user.customer?.id || null,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' },
    });
  }
}

export function authorize(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' },
      });
    }

    next();
  };
}
