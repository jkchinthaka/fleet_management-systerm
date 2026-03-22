export type ApiResponse<T> = { success: boolean; data: T; message?: string };

export type AppUser = {
  id: number | string;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  createdAt?: string;
};

export type DashboardSummary = {
  overview: {
    totalVehicles: number;
    totalFuelConsumption: number;
    monthlyExpenses: number;
    activeServiceRequests: number;
  };
  charts: {
    fuelTrend: Array<{ month: string; fuelQuantity: number; fuelCost: number }>;
    electricityWaterTrend: Array<{ month: string; electricity: number; water: number }>;
    maintenanceCostTrend: Array<{ month: string; cost: number }>;
  };
  recentActivities: Array<{ id: number; text: string; at: string }>;
};

export type Vehicle = {
  id: number;
  registration_number: string;
  make?: string;
  model?: string;
  year?: number;
  status?: string;
  branch?: string;
  last_service_date?: string;
};

export type FuelLog = {
  id: number;
  vehicle_id: number;
  log_date: string;
  fuel_quantity: number;
  cost: number;
  mileage: number;
  fuel_efficiency: number;
  vehicle?: Vehicle;
};

export type UtilityReading = {
  id: number;
  reading_date: string;
  meter_location: string;
  units_consumed: number;
  cost: number;
};

export type UtilityComparison = {
  month: string;
  waterUnits: number;
  waterCost: number;
  electricityUnits: number;
  electricityCost: number;
};

export type Product = {
  id: number;
  sku: string;
  product_name: string;
  category?: string;
  unit_price: number;
  current_stock: number;
  reorder_level: number;
};

export type Supplier = {
  id: number;
  supplier_name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
};

export type PurchaseOrder = {
  id: number;
  supplier_id: number;
  order_date: string;
  expected_date?: string;
  status: string;
  total_amount: number;
  supplier?: Supplier;
  items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    line_total: number;
    product?: Product;
  }>;
};

export type StockMovement = {
  id: number;
  product_id: number;
  movement_type: string;
  quantity: number;
  movement_date: string;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  product?: Product;
};

export type Grn = {
  id: number;
  purchase_order_id: number;
  grn_date: string;
  received_by: string;
  items?: Array<{
    id: number;
    product_id: number;
    quantity_received: number;
    product?: Product;
  }>;
};

export type CreatePurchaseOrderPayload = {
  supplier_id: number;
  order_date: string;
  expected_date?: string;
  status?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
  }>;
};

export type CreateGrnPayload = {
  purchase_order_id: number;
  grn_date: string;
  received_by: string;
  items: Array<{
    product_id: number;
    quantity_received: number;
  }>;
};

export type Machine = {
  id: number;
  machine_code: string;
  machine_name: string;
  location?: string;
  status: string;
  last_service_date?: string;
  next_service_date?: string;
};

export type MachineServiceHistory = {
  id: number;
  machine_id: number;
  service_date: string;
  description?: string;
  service_cost: number;
  technician?: string;
};

export type MachineMaintenanceSchedule = {
  id: number;
  machine_id: number;
  due_date: string;
  maintenance_type: string;
  priority?: string;
  status?: string;
};

export type Asset = {
  id: number;
  asset_tag: string;
  asset_name: string;
  category?: string;
  location?: string;
  purchase_date?: string;
  status?: string;
};

export type AttendanceRecord = {
  id: number;
  user_id: string;
  user_email?: string;
  attendance_date: string;
  check_in?: string;
  check_out?: string;
  status: 'Present' | 'Absent' | 'Leave';
  location?: string;
};

export type AttendanceMonthlySummary = {
  user_id: string;
  user_email?: string;
  presentDays: number;
  absentDays: number;
};

export type NotificationItem = {
  id: number;
  module: string;
  title: string;
  message: string;
  severity: 'Info' | 'Medium' | 'High';
  is_read: boolean;
  created_at: string;
};

export type ServiceRequest = {
  id: number;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assigned_technician_id?: number;
  sla_deadline?: string;
  total_cost?: number;
  updated_at?: string;
};

export type VehicleDocument = {
  id: number;
  vehicle_id: number;
  document_type: string;
  document_number?: string;
  expiry_date?: string;
  vehicle?: Vehicle;
};

export type AlertThreshold = {
  id: number;
  module: string;
  metric_key: string;
  threshold_value: number;
  comparison_operator: string;
  is_active: boolean;
};
