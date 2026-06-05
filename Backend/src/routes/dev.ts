import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

/** Lists seeded users so the frontend can pick an X-User-Id during development. */
export const devRouter = Router();

devRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});
