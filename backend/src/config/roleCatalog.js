export const ROLE_CATALOG = {
  1: 'Admin',
  2: 'Fleet Manager',
  3: 'Technician',
  4: 'Inventory Manager',
  5: 'Finance Officer',
  6: 'Driver',
  7: 'Supervisor'
};

export const ROLE_IDS = Object.freeze(Object.keys(ROLE_CATALOG).map(Number));

export const getRoleNameById = (roleId) => ROLE_CATALOG[roleId] || null;
