import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccess } from '../config/rbac.js';

export const authenticate = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const token = header.replace('Bearer ', '').trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    next();
  } catch {
    next(new ApiError(401, 'Invalid token'));
  }
};

export const authorize = (...allowedRoleIds) => (req, _res, next) => {
  if (!req.user || !allowedRoleIds.includes(req.user.roleId)) {
    return next(new ApiError(403, 'Forbidden'));
  }
  next();
};

export const authorizeModuleAccess = (moduleKey, action = 'read') => (req, _res, next) => {
  if (!req.user?.roleId) {
    return next(new ApiError(403, 'Forbidden'));
  }

  if (!canAccess(req.user.roleId, moduleKey, action)) {
    return next(new ApiError(403, `Forbidden: ${moduleKey}:${action}`));
  }

  next();
};
