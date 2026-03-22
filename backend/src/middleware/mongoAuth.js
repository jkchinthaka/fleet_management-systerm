import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticateJwt = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const token = header.slice(7).trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.authUser = payload;
    next();
  } catch {
    next(new ApiError(401, 'Invalid token'));
  }
};

export const authorizeRoles = (...allowedRoleIds) => (req, _res, next) => {
  if (!req.authUser || !allowedRoleIds.includes(req.authUser.roleId)) {
    return next(new ApiError(403, 'Forbidden'));
  }

  next();
};
