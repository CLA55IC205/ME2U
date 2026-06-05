import { Router } from 'express';
import { param } from '../lib/params.js';
import * as orderService from '../services/orderService.js';

export const trackingRouter = Router();

trackingRouter.get('/:trackingNumber', async (req, res, next) => {
  try {
    const result = await orderService.trackByNumber(param(req.params.trackingNumber));
    res.json(result);
  } catch (err) {
    next(err);
  }
});
