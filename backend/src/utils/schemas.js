import { z } from 'zod';

const roleIds = [1, 2, 3, 4, 5, 6, 7];

export const mongoRegisterSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  roleId: z.number().int().refine((value) => roleIds.includes(value), 'Invalid roleId')
});

export const mongoLoginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72)
});

export const registerSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role_id: z.number().int().positive()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const vehicleSchema = z.object({
  registration_number: z.string().min(3),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1980).max(2100).optional(),
  status: z.string().optional(),
  branch: z.string().optional(),
  last_service_date: z.string().optional()
});

export const fuelLogSchema = z.object({
  vehicle_id: z.number().int().positive(),
  log_date: z.string().min(1, 'Date is required'),
  fuel_quantity: z.number().positive(),
  cost: z.number().nonnegative(),
  mileage: z.number().nonnegative()
});

export const serviceRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
  assigned_technician_id: z.number().int().optional(),
  sla_deadline: z.string().optional(),
  total_cost: z.number().nonnegative().optional()
});

export const serviceStatusUpdateSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'])
});

export const serviceTaskSchema = z.object({
  service_request_id: z.number().int().positive(),
  task_name: z.string().min(2),
  assigned_technician_id: z.number().int().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  hours_spent: z.number().nonnegative().optional(),
  labor_cost: z.number().nonnegative().optional()
});

export const serviceSparePartSchema = z.object({
  service_task_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  quantity: z.number().positive(),
  unit_cost: z.number().nonnegative()
});

export const waterMeterSchema = z.object({
  reading_date: z.string().min(1, 'Date is required'),
  meter_location: z.string().min(2),
  units_consumed: z.coerce.number().positive(),
  cost: z.coerce.number().nonnegative()
});

export const electricitySchema = z.object({
  reading_date: z.string().min(1, 'Date is required'),
  meter_location: z.string().min(2),
  units_consumed: z.coerce.number().positive(),
  cost: z.coerce.number().nonnegative()
});

export const productSchema = z.object({
  sku: z.string().min(2),
  product_name: z.string().min(2),
  category: z.string().optional(),
  unit_price: z.number().nonnegative(),
  current_stock: z.number().nonnegative().optional(),
  reorder_level: z.number().nonnegative().optional()
});

export const supplierSchema = z.object({
  supplier_name: z.string().min(2),
  contact_email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const purchaseOrderSchema = z.object({
  supplier_id: z.number().int().positive(),
  order_date: z.string().min(1, 'Date is required'),
  expected_date: z.string().optional(),
  status: z.enum(['Draft', 'Issued', 'Approved', 'Partial', 'Received', 'Closed']).optional(),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().positive(),
      unit_price: z.number().nonnegative()
    })
  ).min(1)
});

export const purchaseOrderStatusSchema = z.object({
  status: z.enum(['Draft', 'Issued', 'Approved', 'Partial', 'Received', 'Closed'])
});

export const grnSchema = z.object({
  purchase_order_id: z.number().int().positive(),
  grn_date: z.string(),
  received_by: z.string().min(2),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity_received: z.number().positive()
    })
  ).min(1)
});

export const machineSchema = z.object({
  machine_code: z.string().min(2),
  machine_name: z.string().min(2),
  location: z.string().optional(),
  status: z.string().optional(),
  last_service_date: z.string().optional(),
  next_service_date: z.string().optional()
});

export const machineServiceHistorySchema = z.object({
  machine_id: z.number().int().positive(),
  service_date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  service_cost: z.number().nonnegative(),
  technician: z.string().optional()
});

export const machineMaintenanceScheduleSchema = z.object({
  machine_id: z.number().int().positive(),
  due_date: z.string().min(1, 'Date is required'),
  maintenance_type: z.string().min(2),
  priority: z.string().optional(),
  status: z.string().optional()
});

export const assetSchema = z.object({
  asset_tag: z.string().min(2),
  asset_name: z.string().min(2),
  category: z.string().optional(),
  location: z.string().optional(),
  purchase_date: z.string().optional(),
  status: z.string().optional()
});

export const attendanceSchema = z.object({
  user_id: z.string().optional(),
  user_email: z.string().optional(),
  attendance_date: z.string().min(1, 'Date is required'),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  status: z.enum(['Present', 'Absent', 'Leave']),
  location: z.string().optional()
});

export const notificationSchema = z.object({
  module: z.string().min(2),
  title: z.string().min(2),
  message: z.string().min(2),
  severity: z.enum(['Info', 'Medium', 'High']).optional()
});

export const reportFilterSchema = z.object({
  name: z.string().min(2),
  module: z.string().min(2),
  filters: z.record(z.any())
});
