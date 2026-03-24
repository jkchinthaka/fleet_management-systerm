import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let reconnectTimer = null;

const connectOptions = {
  dbName: env.mongo.dbName,
  serverSelectionTimeoutMS: 15000,
  heartbeatFrequencyMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true
};

export const isDbConfigured = () => Boolean(env.mongo.uri);

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const waitForDbConnection = async (timeoutMs = 8000, pollMs = 250) => {
  if (!isDbConfigured()) {
    return false;
  }

  if (isDbConnected()) {
    return true;
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (isDbConnected()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  return isDbConnected();
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDB();
    } catch {
      scheduleReconnect();
    }
  }, 10000);
};

export const connectDB = async () => {
  if (!isDbConfigured()) {
    logger.warn('MongoDB URI is not configured. Starting API without database connection. Set MONGODB_URI to enable persistence.');
    return false;
  }

  try {
    await mongoose.connect(env.mongo.uri, connectOptions);
    logger.info('MongoDB connection established');

    if (!mongoose.connection.listeners('disconnected').length) {
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Retrying in 10s...');
        scheduleReconnect();
      });
    }

    if (!mongoose.connection.listeners('error').length) {
      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });
    }

    return true;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    scheduleReconnect();
    return false;
  }
};
