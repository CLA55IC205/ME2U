import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { devRouter } from './routes/dev.js';
import { ordersRouter } from './routes/orders.js';
import { trackingRouter } from './routes/tracking.js';
import { adminRouter } from './routes/admin.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.includes(origin) || env.corsOrigins.includes('*')) {
          callback(null, true);
          return;
        }
        if (env.nodeEnv === 'development') {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use(healthRouter);
  app.use('/api/dev', devRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/tracking', trackingRouter);
  app.use('/api/admin', adminRouter);

  app.use(errorHandler);

  return app;
}
