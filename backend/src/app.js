import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { isDbConnected } from './config/db.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { buildRoutes } from './routes/index.js';

const app = express();
const allowedOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const apiPrefixes = Array.from(new Set([env.apiPrefix, '/api/v1', '/api']));

const corsOriginValidator = (origin, callback) => {
  // Allow non-browser clients and same-origin requests.
  if (!origin) {
    callback(null, true);
    return;
  }

  const isExplicitlyAllowed = allowedOrigins.includes(origin);
  const isNetlifyApp = /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin);

  if (isExplicitlyAllowed || isNetlifyApp) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};

app.use(helmet());
app.use(
  cors({
    origin: corsOriginValidator,
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
  const dbConnected = isDbConnected();
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

apiPrefixes.forEach((prefix) => {
  app.use(buildRoutes(prefix));
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
