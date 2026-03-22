import { createLogger, format, transports } from 'winston';
import { env } from './env.js';

export const logger = createLogger({
  level: env.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}] ${stack || message}`;
    })
  ),
  transports: [new transports.Console()]
});
