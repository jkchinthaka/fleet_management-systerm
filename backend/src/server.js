import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';

const start = async () => {
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });

  const connected = await connectDB();
  if (!connected) {
    logger.warn('Server started without database connection. Background retries are active.');
  }
};

start().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
