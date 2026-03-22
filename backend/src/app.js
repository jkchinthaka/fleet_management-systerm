import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { buildRoutes } from './routes/index.js';

const app = express();
const allowedOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(apiRateLimiter);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    name: 'Fleet Management API',
    version: '1.0.0',
    status: 'running',
    apiBase: env.apiPrefix,
    health: '/health',
    docs: `${env.apiPrefix}/auth/login`
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

app.use(buildRoutes(env.apiPrefix));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
