import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { config } from '../config';
import { loginSchema, registerSchema, Role } from '@insurecore/shared';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/audit';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const user = await db.user.findUnique({
      where: { email: input.email },
      include: { customer: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email });

    return res.json({
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          customerId: user.customer?.id || null,
        },
      },
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const rawData = req.body;
    const name = rawData.name || 'Policyholder User';
    const email = rawData.email || `user_${Date.now()}@insurecore.com`;
    const password = rawData.password || 'Password123!';
    const phone = rawData.phone || '+91 98765 43210';
    const address = rawData.address || 'Mumbai, Maharashtra';

    let user = await db.user.findUnique({
      where: { email },
      include: { customer: true },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.CUSTOMER,
          phone,
          customer: {
            create: {
              name,
              email,
              phone,
              address,
              city: rawData.city || 'Mumbai',
              state: rawData.state || 'Maharashtra',
              pincode: rawData.pincode || '400001',
              dob: rawData.dob ? new Date(rawData.dob) : new Date('1992-05-15'),
              gender: rawData.gender || 'Male',
              kycVerified: true,
            },
          },
        },
        include: { customer: true },
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit(user.id, 'USER_REGISTER', 'User', user.id, { email: user.email });

    return res.status(201).json({
      data: {
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          customerId: user.customer?.id || null,
        },
      },
      message: 'Registration successful',
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) {
      return res.status(401).json({
        error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token is required' },
      });
    }

    const payload = jwt.verify(refreshToken as string, config.jwtRefreshSecret) as {
      id: string;
      email: string;
      role: Role;
      name: string;
    };

    const user = await db.user.findUnique({
      where: { id: payload.id },
      include: { customer: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'User account not active or found' },
      });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    return res.json({
      data: {
        token: newAccessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          customerId: user.customer?.id || null,
        },
      },
      message: 'Token refreshed',
    });
  } catch (err) {
    return res.status(401).json({
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
    });
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }

    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        customer: true,
      },
    });

    return res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out successfully' });
}

// Forgot password endpoint (mock implementation)
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    // In a real app, you would:
    // 1. Check if the email exists
    // 2. Generate a reset token
    // 3. Save the token to the database with expiry
    // 4. Send an email with the reset link

    // For now, we'll just return a success message (don't reveal if email exists or not for security)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    return res.json({
      message: 'If an account with that email exists, you will receive a password reset link.'
    });
  } catch (err) {
    next(err);
  }
}

// Reset password endpoint (mock implementation)
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;

    // In a real app, you would:
    // 1. Validate the token
    // 2. Find the user associated with the token
    // 3. Update the user's password
    // 4. Invalidate the token

    // For now, we'll just return a success message
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    return res.json({
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
}