import { Router } from 'express';
import { UserRole, WalletProvider } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { param } from '../lib/params.js';
import * as orderService from '../services/orderService.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get('/', async (req, res, next) => {
  try {
    const orders = await orderService.listOrdersForUser(req.user!.id, req.user!.role);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:publicId', async (req, res, next) => {
  try {
    const order = await orderService.getOrderByPublicId(
      param(req.params.publicId),
      req.user!.id,
      req.user!.role,
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

const createOrderSchema = z.object({
  sellerPhone: z.string().min(5),
  sellerName: z.string().optional(),
  itemDescription: z.string().min(1),
  amountZmw: z.number().positive(),
  origin: z.string().optional(),
  destination: z.string().min(1),
  courier: z.string().optional(),
  notes: z.string().optional(),
  paymentProvider: z.enum(['MTN', 'AIRTEL', 'mtn', 'airtel']).transform((v) =>
    v.toUpperCase() === 'MTN' ? WalletProvider.MTN : WalletProvider.AIRTEL,
  ),
});

ordersRouter.post('/', requireRole(UserRole.BUYER), async (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const result = await orderService.createOrder({
      buyerId: req.user!.id,
      ...body,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

ordersRouter.post('/:publicId/confirm-payment', requireRole(UserRole.BUYER), async (req, res, next) => {
  try {
    const order = await orderService.confirmPayment(param(req.params.publicId), req.user!.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

const dispatchSchema = z.object({
  courier: z.string().min(1),
  trackingNumber: z.string().optional(),
});

ordersRouter.patch('/:publicId/dispatch', requireRole(UserRole.SELLER), async (req, res, next) => {
  try {
    const body = dispatchSchema.parse(req.body);
    const order = await orderService.markDispatched(param(req.params.publicId), req.user!.id, body);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post('/:publicId/arrival', requireRole(UserRole.SELLER), async (req, res, next) => {
  try {
    const order = await orderService.markArrival(param(req.params.publicId), req.user!.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post('/:publicId/confirm-receipt', requireRole(UserRole.BUYER), async (req, res, next) => {
  try {
    const order = await orderService.confirmReceipt(param(req.params.publicId), req.user!.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

const disputeSchema = z.object({
  reason: z.string().min(1),
  detail: z.string().optional(),
});

ordersRouter.post('/:publicId/disputes', requireRole(UserRole.BUYER), async (req, res, next) => {
  try {
    const body = disputeSchema.parse(req.body);
    const order = await orderService.raiseDispute(param(req.params.publicId), req.user!.id, body);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});
