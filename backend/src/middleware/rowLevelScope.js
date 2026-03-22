import { ROLE_IDS } from '../config/rbac.js';

export const enforceDriverAttendanceScope = (req, _res, next) => {
  if (req.user?.roleId === ROLE_IDS.DRIVER_EMPLOYEE) {
    req.query.userId = String(req.user.sub);
    req.body.user_id = req.user.sub;
  }
  next();
};

// Drivers can only see their own vehicle's fuel logs
export const enforceDriverFuelScope = (req, _res, next) => {
  if (req.user?.roleId === ROLE_IDS.DRIVER_EMPLOYEE && req.user?.vehicleId) {
    req.query.vehicleId = String(req.user.vehicleId);
  }
  next();
};
