export const ROLE_CATALOG = {
  1: 'Admin',
  2: 'Fleet Manager',
  3: 'Maintenance Technician',
  4: 'Inventory Purchasing Officer',
  5: 'Finance Accountant',
  6: 'Driver Employee',
  7: 'Supervisor Manager'
};

export const ROLE_IDS = Object.freeze(Object.keys(ROLE_CATALOG).map(Number));

export const getRoleNameById = (roleId) => ROLE_CATALOG[roleId] || null;
