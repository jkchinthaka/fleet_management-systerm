export const ROLE_IDS = {
  ADMIN: 1,
  FLEET_MANAGER: 2,
  MAINTENANCE_TECHNICIAN: 3,
  INVENTORY_PURCHASING_OFFICER: 4,
  FINANCE_ACCOUNTANT: 5,
  DRIVER_EMPLOYEE: 6,
  SUPERVISOR_MANAGER: 7
};

export const ROLE_NAMES = Object.entries(ROLE_IDS).reduce((acc, [name, id]) => {
  acc[id] = name;
  return acc;
}, {});

const allow = (...roles) => new Set(roles);

export const MODULE_ACCESS = {
  dashboard: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.FINANCE_ACCOUNTANT,
      ROLE_IDS.SUPERVISOR_MANAGER
    )
  },
  vehicle: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.DRIVER_EMPLOYEE,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    write: allow(ROLE_IDS.ADMIN, ROLE_IDS.FLEET_MANAGER)
  },
  fuel: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.DRIVER_EMPLOYEE,
      ROLE_IDS.FINANCE_ACCOUNTANT,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    write: allow(ROLE_IDS.ADMIN, ROLE_IDS.FLEET_MANAGER, ROLE_IDS.DRIVER_EMPLOYEE)
  },
  utility: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.MAINTENANCE_TECHNICIAN,
      ROLE_IDS.INVENTORY_PURCHASING_OFFICER,
      ROLE_IDS.FINANCE_ACCOUNTANT,
      ROLE_IDS.DRIVER_EMPLOYEE,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    write: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.MAINTENANCE_TECHNICIAN,
      ROLE_IDS.INVENTORY_PURCHASING_OFFICER,
      ROLE_IDS.FINANCE_ACCOUNTANT,
      ROLE_IDS.DRIVER_EMPLOYEE,
      ROLE_IDS.SUPERVISOR_MANAGER
    )
  },
  machineAsset: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.MAINTENANCE_TECHNICIAN,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    write: allow(ROLE_IDS.ADMIN, ROLE_IDS.FLEET_MANAGER, ROLE_IDS.MAINTENANCE_TECHNICIAN)
  },
  service: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.MAINTENANCE_TECHNICIAN,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    write: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.MAINTENANCE_TECHNICIAN,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    approve: allow(ROLE_IDS.ADMIN, ROLE_IDS.SUPERVISOR_MANAGER)
  },
  inventory: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.INVENTORY_PURCHASING_OFFICER,
      ROLE_IDS.FINANCE_ACCOUNTANT
    ),
    write: allow(ROLE_IDS.ADMIN, ROLE_IDS.INVENTORY_PURCHASING_OFFICER),
    approve: allow(ROLE_IDS.ADMIN, ROLE_IDS.FINANCE_ACCOUNTANT)
  },
  attendance: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.SUPERVISOR_MANAGER,
      ROLE_IDS.DRIVER_EMPLOYEE
    ),
    write: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.SUPERVISOR_MANAGER,
      ROLE_IDS.DRIVER_EMPLOYEE
    )
  },
  notifications: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FLEET_MANAGER,
      ROLE_IDS.MAINTENANCE_TECHNICIAN,
      ROLE_IDS.INVENTORY_PURCHASING_OFFICER,
      ROLE_IDS.FINANCE_ACCOUNTANT,
      ROLE_IDS.SUPERVISOR_MANAGER
    ),
    write: allow(ROLE_IDS.ADMIN, ROLE_IDS.FLEET_MANAGER, ROLE_IDS.INVENTORY_PURCHASING_OFFICER)
  },
  reports: {
    read: allow(
      ROLE_IDS.ADMIN,
      ROLE_IDS.FINANCE_ACCOUNTANT,
      ROLE_IDS.SUPERVISOR_MANAGER,
      ROLE_IDS.FLEET_MANAGER
    )
  }
};

export const canAccess = (roleId, moduleKey, action = 'read') => {
  if (roleId === ROLE_IDS.ADMIN) return true;
  const moduleRules = MODULE_ACCESS[moduleKey];
  if (!moduleRules) return false;
  const allowed = moduleRules[action];
  if (!allowed) return false;
  return allowed.has(roleId);
};
