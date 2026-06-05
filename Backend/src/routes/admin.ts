import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { param } from '../lib/params.js';
import * as adminService from '../services/adminService.js';
import * as orderService from '../services/orderService.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(UserRole.ADMIN));

adminRouter.get('/escrow', async (_req, res, next) => {
  try {
    res.json(await adminService.getEscrowSummary());
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/orders', async (_req, res, next) => {
  try {
    res.json({ orders: await adminService.listAllOrders() });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/disputes', async (_req, res, next) => {
  try {
    res.json({ disputes: await adminService.listOpenDisputes() });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/auto-releases', async (_req, res, next) => {
  try {
    res.json({ pending: await adminService.listPendingAutoReleases() });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/auto-releases/run', async (_req, res, next) => {
  try {
    const released = await orderService.runAutoReleases();
    res.json({ released });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', async (_req, res, next) => {
  try {
    res.json({ users: await adminService.listUsersSummary() });
  } catch (err) {
    next(err);
  }
});

const resolveSchema = z.object({
  resolution: z.enum(['seller', 'buyer', 'split']),
});

adminRouter.post('/disputes/:publicId/resolve', async (req, res, next) => {
  try {
    const { resolution } = resolveSchema.parse(req.body);
    const order = await adminService.resolveDispute(param(req.params.publicId), resolution);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/orders/:publicId/release', async (req, res, next) => {
  try {
    const order = await adminService.forceRelease(param(req.params.publicId));
    res.json({ order });
  } catch (err) {
    next(err);
  }
});
