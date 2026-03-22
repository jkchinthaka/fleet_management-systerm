import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecretRaw = process.env.JWT_SECRET || 'unsafe_default_change_me';
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI (or MONGO_URI) environment variable');
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
    uri: mongoUri,
    dbName: process.env.MONGODB_DB_NAME || 'fleet_db'
  },
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
