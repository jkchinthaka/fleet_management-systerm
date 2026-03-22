import { logger } from '../config/logger.js';

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

export const errorHandler = (error, _req, res, _next) => {
  // MongoDB Atlas connection errors → 503 instead of 500
  const isMongoConnErr =
    error.name === 'MongoServerSelectionError' ||
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoNetworkTimeoutError' ||
    (error.name === 'MongooseError' && error.message && error.message.includes('buffering timed out'));

  const statusCode = isMongoConnErr ? 503 : (error.statusCode || 500);
  const message = isMongoConnErr
    ? 'Database temporarily unavailable. Please try again in a moment.'
    : (error.message || 'Internal server error');

  if (statusCode >= 500) {
    logger.error(error.stack || message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details || null
  });
};
