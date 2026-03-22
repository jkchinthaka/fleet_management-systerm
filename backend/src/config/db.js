import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongo.uri, {
      dbName: env.mongo.dbName,
      serverSelectionTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      retryReads: true
    });
    logger.info('MongoDB connection established');

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected  retrying in 10s...');
      setTimeout(() => mongoose.connect(env.mongo.uri, { dbName: env.mongo.dbName }), 10000);
    });
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    throw err;
  }
};
