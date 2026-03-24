import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecretRaw = process.env.JWT_SECRET || 'unsafe_default_change_me';
const mongoUriFromEnv =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URL ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

const mongoUriFallback = nodeEnv === 'development' ? 'mongodb://localhost:27017' : '';
const mongoUri = mongoUriFromEnv || mongoUriFallback;

if (!mongoUriFromEnv && nodeEnv === 'development') {
  console.warn('[CONFIG] Mongo URI env var not found. Using local fallback mongodb://localhost:27017 for development.');
}

if (!mongoUri && nodeEnv !== 'development') {
  console.warn(
    '[CONFIG] Mongo URI env var not found in non-development environment. Server will start in degraded mode until MONGODB_URI is configured.'
  );
}

const hasWeakJwtSecret = jwtSecretRaw === 'unsafe_default_change_me' || jwtSecretRaw === 'replace_with_long_secret';
const jwtSecret = hasWeakJwtSecret
  ? (process.env.JWT_SECRET_FALLBACK || 'local_dev_jwt_secret_please_override_123')
  : jwtSecretRaw;

if (nodeEnv === 'production' && hasWeakJwtSecret) {
  console.warn('[SECURITY] Weak JWT_SECRET detected. Using JWT_SECRET_FALLBACK. Set a strong JWT_SECRET in environment.');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  mongo: {
    uri: mongoUri || null,
    dbName: process.env.MONGODB_DB_NAME || 'Fleet_New'
  },
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173,https://symphonious-daifuku-d9d945.netlify.app'
};
