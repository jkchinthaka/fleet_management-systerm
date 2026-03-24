import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { isDbConnected } from './config/db.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { buildRoutes } from './routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const apiPrefixes = [env.apiPrefix];
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const shouldServeFrontend = env.nodeEnv === 'production' && fs.existsSync(frontendIndexPath);

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
app.use(express.json({ limit: '10mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(apiRateLimiter);

app.get(`${env.apiPrefix}/meta`, (_req, res) => {
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

if (shouldServeFrontend) {
  app.use(express.static(frontendDistPath, { index: false }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith(env.apiPrefix) || req.path === '/health') {
      next();
      return;
    }

    res.sendFile(frontendIndexPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
