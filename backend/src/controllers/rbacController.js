import { ROLE_IDS, ROLE_NAMES, MODULE_ACCESS } from '../config/rbac.js';

const serializableAccess = Object.fromEntries(
  Object.entries(MODULE_ACCESS).map(([moduleKey, actions]) => [
    moduleKey,
    Object.fromEntries(Object.entries(actions).map(([action, roleSet]) => [action, Array.from(roleSet)]))
  ])
);

export const rbacController = {
  matrix: (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        roles: ROLE_IDS,
        roleNames: ROLE_NAMES,
        moduleAccess: serializableAccess
      }
    });
  }
};
