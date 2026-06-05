import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { forbidden, notFound } from '../lib/errors.js';

export type AuthUser = {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Dev auth: send `X-User-Id` with a seeded user's UUID (see GET /api/dev/users).
 * Production: replace with JWT validation.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = req.header('x-user-id');
    if (!userId) {
      if (env.authDevMode) {
        return next(forbidden('Missing X-User-Id header (dev mode)'));
      }
      return next(forbidden('Unauthorized'));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(notFound('User not found'));

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden('Insufficient role'));
    }
    next();
  };
}
