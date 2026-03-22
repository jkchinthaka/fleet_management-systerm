import { logger } from '../config/logger.js';

export const auditLog = (event, payload) => {
  logger.info(JSON.stringify({
    kind: 'audit',
    event,
    ...payload,
    at: new Date().toISOString()
  }));
};
