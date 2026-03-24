export type RoleTaskDefinition = {
  roleName: string;
  responsibilities: string[];
};

export const ROLE_TASKS_BY_ID: Record<number, RoleTaskDefinition> = {
  1: {
    roleName: 'Admin',
    responsibilities: [
      'Manage users',
      'Assign roles',
      'Maintain access policies',
      'Oversee all system modules'
    ]
  },
  2: {
    roleName: 'Fleet Manager',
    responsibilities: [
      'Manage vehicles and fleet operations',
      'Monitor dashboard KPIs',
      'Coordinate fleet performance'
    ]
  },
  3: {
    roleName: 'Technician',
    responsibilities: [
      'Create service requests',
      'Update maintenance tasks',
      'Maintain machine service history'
    ]
  },
  4: {
    roleName: 'Inventory Manager',
    responsibilities: [
      'Manage products and suppliers',
      'Manage purchase orders and GRNs',
      'Manage stock movements'
    ]
  },
  5: {
    roleName: 'Finance Officer',
    responsibilities: [
      'Review utility and fuel cost records',
      'Analyze spending trends',
      'Support financial reporting'
    ]
  },
  6: {
    roleName: 'Driver',
    responsibilities: [
      'Submit attendance entries',
      'Submit daily operational entries for assigned activities'
    ]
  },
  7: {
    roleName: 'Supervisor',
    responsibilities: [
      'Review operational data',
      'Monitor team execution',
      'Approve supervised workflows'
    ]
  }
};
