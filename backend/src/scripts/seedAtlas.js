/**
 * Atlas seed script — creates all collections + demo data in the fleet_new database.
 * Run from the project root:
 *   docker exec fleet-backend node src/scripts/seedAtlas.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'Fleet_New';

if (!ATLAS_URI) {
  throw new Error('Missing MONGODB_URI. Set it in environment before running seedAtlas.js');
}

await mongoose.connect(ATLAS_URI, { dbName: DB_NAME });
console.log(`Connected to MongoDB Atlas — database: ${DB_NAME}`);

const db = mongoose.connection.db;

// ─── Drop & recreate collections cleanly ──────────────────────────────────────
const COLLECTIONS = [
  'users', 'vehicles', 'fuel_logs', 'suppliers', 'products',
  'purchase_orders', 'purchase_order_items', 'grns', 'grn_items',
  'stock_movements', 'service_requests', 'service_tasks', 'service_spare_parts',
  'machines', 'machine_service_history', 'machine_maintenance_schedules',
  'assets', 'user_attendance', 'electricity_data', 'water_meter_data',
  'alert_thresholds', 'vehicle_documents', 'notifications', 'counters'
];

for (const name of COLLECTIONS) {
  try { await db.dropCollection(name); } catch { /* didn't exist */ }
  await db.createCollection(name);
}
console.log('Collections created');

// ─── Unique indexes ────────────────────────────────────────────────────────────
await db.collection('users').createIndex({ email: 1 }, { unique: true });
await db.collection('vehicles').createIndex({ registration_number: 1 }, { unique: true });
await db.collection('products').createIndex({ sku: 1 }, { unique: true });
console.log('Indexes created');

// ─── Users (7 fixed accounts, pre-hashed passwords) ────────────────────────────
// Passwords: Admin@12345, Fleet@12345, Tech@12345, Inv@12345,
//            Finance@12345, Driver@12345, Super@12345
await db.collection('users').insertMany([
  { id: 1, name: 'System Admin',       email: 'ta9@fleet.com',     password: '$2a$12$oT3xOUDpKMq4A7hTqxLOOeikHKpnfUKd8vmiJm4Ds24ou8s4QTp2q', roleId: 1, roleName: 'Admin',                         createdAt: new Date() },
  { id: 2, name: 'Fleet Manager',      email: 'fleet@fleet.com',   password: '$2a$12$.YGB6VoZ6Ke6DM8owKsoiuKGef2PiOwCcuCY..2aRswAGpAZFK/d2',  roleId: 2, roleName: 'Fleet Manager',               createdAt: new Date() },
  { id: 3, name: 'Maintenance Tech',   email: 'tech@fleet.com',    password: '$2a$12$FwCBglb9uaGACZvmw14BvOu4PXqb9lCZ2upCd8SQeuJpZdObbo9xe',  roleId: 3, roleName: 'Technician',                  createdAt: new Date() },
  { id: 4, name: 'Inventory Officer',  email: 'inv@fleet.com',     password: '$2a$12$9Hk6LjJRvpTiicfg8SpJV.MCzXs1faA3YwgVD0qmDlHUX66ThPoG6',  roleId: 4, roleName: 'Inventory Manager',           createdAt: new Date() },
  { id: 5, name: 'Finance Accountant', email: 'finance@fleet.com', password: '$2a$12$mgJxON3ZrRcsBHJfSugK6ewkaJEi2K945hgMapb6N3UJJfuc/k6v2',  roleId: 5, roleName: 'Finance Officer',             createdAt: new Date() },
  { id: 6, name: 'Driver Employee',    email: 'driver@fleet.com',  password: '$2a$12$mvgjtqlCdUUCBGGdII6bQ.ggKTjrfY0bpOBNkFMfTaLHM.Unt4yly',  roleId: 6, roleName: 'Driver',                      createdAt: new Date() },
  { id: 7, name: 'Supervisor Manager', email: 'super@fleet.com',   password: '$2a$12$cRZuFg6GIvpS9ic3dH6Ieu/MZE79ImoPP./s4NvOVdGn05bd.ydR2',  roleId: 7, roleName: 'Supervisor',                  createdAt: new Date() },
]);
console.log('Users seeded (7)');

// ─── Vehicles ──────────────────────────────────────────────────────────────────
await db.collection('vehicles').insertMany([
  { id: 1, registration_number: 'KCA 001A', make: 'Toyota',     model: 'Land Cruiser', year: 2020, status: 'Active',            branch: 'Nairobi HQ', last_service_date: new Date('2024-06-01') },
  { id: 2, registration_number: 'KCB 202B', make: 'Isuzu',      model: 'D-Max',        year: 2019, status: 'Active',            branch: 'Mombasa',    last_service_date: new Date('2024-04-15') },
  { id: 3, registration_number: 'KCC 303C', make: 'Mitsubishi', model: 'Canter',       year: 2021, status: 'Under Maintenance', branch: 'Kisumu',     last_service_date: new Date('2024-01-10') },
  { id: 4, registration_number: 'KCD 404D', make: 'Ford',       model: 'Ranger',       year: 2022, status: 'Active',            branch: 'Nakuru',     last_service_date: new Date('2024-07-20') },
  { id: 5, registration_number: 'KCE 505E', make: 'Toyota',     model: 'Hilux',        year: 2018, status: 'Inactive',          branch: 'Eldoret',    last_service_date: new Date('2023-12-01') },
]);
console.log('Vehicles seeded (5)');

// ─── Fuel Logs ─────────────────────────────────────────────────────────────────
await db.collection('fuel_logs').insertMany([
  { id: 1, vehicle_id: 1, log_date: new Date('2024-10-05'), fuel_quantity: 60, cost: 9000,  mileage: 75200, fuel_efficiency: 12.5 },
  { id: 2, vehicle_id: 2, log_date: new Date('2024-10-10'), fuel_quantity: 50, cost: 7500,  mileage: 43100, fuel_efficiency: 11.0 },
  { id: 3, vehicle_id: 1, log_date: new Date('2024-11-01'), fuel_quantity: 55, cost: 8250,  mileage: 75800, fuel_efficiency: 12.0 },
  { id: 4, vehicle_id: 3, log_date: new Date('2024-11-15'), fuel_quantity: 80, cost: 12000, mileage: 64000, fuel_efficiency: 9.5  },
  { id: 5, vehicle_id: 4, log_date: new Date('2024-12-01'), fuel_quantity: 45, cost: 6750,  mileage: 31500, fuel_efficiency: 13.2 },
  { id: 6, vehicle_id: 2, log_date: new Date('2024-12-10'), fuel_quantity: 52, cost: 7800,  mileage: 43700, fuel_efficiency: 11.3 },
]);
console.log('Fuel logs seeded (6)');

// ─── Suppliers ─────────────────────────────────────────────────────────────────
await db.collection('suppliers').insertMany([
  { id: 1, supplier_name: 'AutoParts Kenya Ltd',  contact_email: 'sales@autopartskenya.co.ke', phone: '+254700111222', address: 'Industrial Area, Nairobi' },
  { id: 2, supplier_name: 'Fuel Masters Ltd',     contact_email: 'orders@fuelmasters.co.ke',   phone: '+254711333444', address: 'Mombasa Road, Nairobi'   },
  { id: 3, supplier_name: 'TechEquip Solutions',  contact_email: 'info@techequip.co.ke',        phone: '+254722555666', address: 'Westlands, Nairobi'       },
]);
console.log('Suppliers seeded (3)');

// ─── Products ──────────────────────────────────────────────────────────────────
await db.collection('products').insertMany([
  { id: 1, sku: 'OIL-5W30',   product_name: 'Engine Oil 5W-30',   category: 'Lubricants', unit_price: 1200,  current_stock: 48, reorder_level: 20 },
  { id: 2, sku: 'FLT-OIL01',  product_name: 'Oil Filter',          category: 'Filters',    unit_price: 450,   current_stock: 35, reorder_level: 15 },
  { id: 3, sku: 'FLT-AIR01',  product_name: 'Air Filter',          category: 'Filters',    unit_price: 600,   current_stock: 22, reorder_level: 10 },
  { id: 4, sku: 'BRK-PAD01',  product_name: 'Brake Pads Set',      category: 'Brakes',     unit_price: 2500,  current_stock: 18, reorder_level: 8  },
  { id: 5, sku: 'TYR-225R16', product_name: 'Tyre 225/70 R16',     category: 'Tyres',      unit_price: 12000, current_stock: 12, reorder_level: 5  },
  { id: 6, sku: 'BAT-12V70',  product_name: 'Battery 12V 70Ah',    category: 'Electrical', unit_price: 8500,  current_stock: 8,  reorder_level: 4  },
]);
console.log('Products seeded (6)');

// ─── Purchase Orders ───────────────────────────────────────────────────────────
await db.collection('purchase_orders').insertMany([
  { id: 1, supplier_id: 1, order_date: new Date('2024-10-01'), expected_date: new Date('2024-10-10'), status: 'Received', total_amount: 36000 },
  { id: 2, supplier_id: 3, order_date: new Date('2024-11-05'), expected_date: new Date('2024-11-15'), status: 'Partial',  total_amount: 85000 },
  { id: 3, supplier_id: 1, order_date: new Date('2024-12-01'), expected_date: new Date('2024-12-10'), status: 'Pending',  total_amount: 22500 },
]);

await db.collection('purchase_order_items').insertMany([
  { id: 1, purchase_order_id: 1, product_id: 1, quantity: 20, unit_price: 1200,  line_total: 24000 },
  { id: 2, purchase_order_id: 1, product_id: 2, quantity: 20, unit_price: 450,   line_total: 9000  },
  { id: 3, purchase_order_id: 1, product_id: 3, quantity: 5,  unit_price: 600,   line_total: 3000  },
  { id: 4, purchase_order_id: 2, product_id: 5, quantity: 5,  unit_price: 12000, line_total: 60000 },
  { id: 5, purchase_order_id: 2, product_id: 6, quantity: 3,  unit_price: 8500,  line_total: 25000 },
  { id: 6, purchase_order_id: 3, product_id: 4, quantity: 9,  unit_price: 2500,  line_total: 22500 },
]);
console.log('Purchase orders + items seeded');

// ─── GRNs ──────────────────────────────────────────────────────────────────────
await db.collection('grns').insertMany([
  { id: 1, purchase_order_id: 1, grn_date: new Date('2024-10-08'), received_by: 'John Kamau'   },
  { id: 2, purchase_order_id: 2, grn_date: new Date('2024-11-12'), received_by: 'Mary Wanjiku' },
]);

await db.collection('grn_items').insertMany([
  { id: 1, grn_id: 1, product_id: 1, quantity_received: 20 },
  { id: 2, grn_id: 1, product_id: 2, quantity_received: 20 },
  { id: 3, grn_id: 1, product_id: 3, quantity_received: 5  },
  { id: 4, grn_id: 2, product_id: 5, quantity_received: 3  },
]);
console.log('GRNs + items seeded');

// ─── Stock Movements ───────────────────────────────────────────────────────────
await db.collection('stock_movements').insertMany([
  { id: 1, product_id: 1, movement_type: 'IN', quantity: 20, movement_date: new Date('2024-10-08'), reference_type: 'GRN', reference_id: 1, notes: 'Stock added by GRN' },
  { id: 2, product_id: 2, movement_type: 'IN', quantity: 20, movement_date: new Date('2024-10-08'), reference_type: 'GRN', reference_id: 1, notes: 'Stock added by GRN' },
  { id: 3, product_id: 5, movement_type: 'IN', quantity: 3,  movement_date: new Date('2024-11-12'), reference_type: 'GRN', reference_id: 2, notes: 'Stock added by GRN' },
]);
console.log('Stock movements seeded (3)');

// ─── Service Requests ──────────────────────────────────────────────────────────
await db.collection('service_requests').insertMany([
  { id: 1, title: 'Engine Check - KCA 001A',     description: 'Vehicle pulling to the left, engine noise', status: 'Completed',  assigned_technician_id: 3, sla_deadline: new Date('2024-10-20'), total_cost: 15500 },
  { id: 2, title: 'Brake Replacement - KCB 202B',description: 'Brake pads worn out',                        status: 'In Progress',assigned_technician_id: 4, sla_deadline: new Date('2024-12-20'), total_cost: 5000  },
  { id: 3, title: 'Full Service - KCC 303C',     description: 'Scheduled 60,000 km service',               status: 'Pending',    assigned_technician_id: null, sla_deadline: new Date('2025-01-10'), total_cost: 0 },
  { id: 4, title: 'Tyre Change - KCD 404D',      description: 'Two front tyres need replacement',           status: 'Completed',  assigned_technician_id: 3, sla_deadline: new Date('2024-09-30'), total_cost: 24000 },
]);

await db.collection('service_tasks').insertMany([
  { id: 1, service_request_id: 1, task_name: 'Oil & Filter Change',    assigned_technician_id: 3, status: 'Completed',  hours_spent: 1,   labor_cost: 1500 },
  { id: 2, service_request_id: 1, task_name: 'Wheel Alignment',        assigned_technician_id: 3, status: 'Completed',  hours_spent: 1.5, labor_cost: 2500 },
  { id: 3, service_request_id: 2, task_name: 'Front Brake Replacement', assigned_technician_id: 4, status: 'In Progress', hours_spent: 0,  labor_cost: 2000 },
]);

await db.collection('service_spare_parts').insertMany([
  { id: 1, service_task_id: 1, product_id: 1, quantity: 4, unit_cost: 1200, total_cost: 4800 },
  { id: 2, service_task_id: 1, product_id: 2, quantity: 1, unit_cost: 450,  total_cost: 450  },
  { id: 3, service_task_id: 3, product_id: 4, quantity: 1, unit_cost: 2500, total_cost: 2500 },
]);
console.log('Service requests + tasks + spare parts seeded');

// ─── Machines ──────────────────────────────────────────────────────────────────
await db.collection('machines').insertMany([
  { id: 1, machine_code: 'MCH-001', machine_name: 'Generator Set 50kVA',  location: 'Nairobi HQ',       status: 'Operational', last_service_date: new Date('2024-08-01'), next_service_date: new Date('2025-02-01') },
  { id: 2, machine_code: 'MCH-002', machine_name: 'Fork Lift - Electric', location: 'Mombasa Warehouse', status: 'Operational', last_service_date: new Date('2024-09-15'), next_service_date: new Date('2025-03-15') },
  { id: 3, machine_code: 'MCH-003', machine_name: 'Air Compressor 200L',  location: 'Workshop Bay 1',   status: 'Under Repair', last_service_date: new Date('2024-05-01'), next_service_date: new Date('2024-11-01') },
]);

await db.collection('machine_service_history').insertMany([
  { id: 1, machine_id: 1, service_date: new Date('2024-08-01'), description: 'Oil change and filters replaced', service_cost: 12000, technician: 'Peter Otieno' },
  { id: 2, machine_id: 2, service_date: new Date('2024-09-15'), description: 'Battery inspection and lubrication', service_cost: 5000, technician: 'Alice Mwangi' },
  { id: 3, machine_id: 3, service_date: new Date('2024-05-01'), description: 'Compressor head overhaul', service_cost: 35000, technician: 'Peter Otieno' },
]);

await db.collection('machine_maintenance_schedules').insertMany([
  { id: 1, machine_id: 1, due_date: new Date('2025-02-01'), maintenance_type: 'Preventive', priority: 'High',   status: 'Scheduled' },
  { id: 2, machine_id: 2, due_date: new Date('2025-03-15'), maintenance_type: 'Preventive', priority: 'Medium', status: 'Scheduled' },
  { id: 3, machine_id: 3, due_date: new Date('2024-12-20'), maintenance_type: 'Corrective', priority: 'High',   status: 'Pending'   },
]);
console.log('Machines + history + schedules seeded');

// ─── Assets ────────────────────────────────────────────────────────────────────
await db.collection('assets').insertMany([
  { id: 1, asset_tag: 'AST-0001', asset_name: 'Dell Laptop Latitude 5420', category: 'IT Equipment', location: 'Finance Office',  purchase_date: new Date('2022-03-10'), status: 'Active' },
  { id: 2, asset_tag: 'AST-0002', asset_name: 'HP LaserJet Pro M404',      category: 'IT Equipment', location: 'Admin Office',    purchase_date: new Date('2021-06-15'), status: 'Active' },
  { id: 3, asset_tag: 'AST-0003', asset_name: 'Steel Office Desk 1.8m',    category: 'Furniture',    location: 'Workshop Office', purchase_date: new Date('2020-01-20'), status: 'Active' },
  { id: 4, asset_tag: 'AST-0004', asset_name: 'CCTV DVR 16-Channel',       category: 'Security',     location: 'Security Room',   purchase_date: new Date('2023-08-01'), status: 'Active' },
]);
console.log('Assets seeded (4)');

// ─── Attendance ────────────────────────────────────────────────────────────────
const today = new Date(); today.setHours(0, 0, 0, 0);
await db.collection('user_attendance').insertMany([
  { id: 1, user_id: 2, user_email: 'fleet@fleet.com', attendance_date: new Date(today - 2*86400000), check_in: '08:02', check_out: '17:05', status: 'Present', location: 'Nairobi HQ' },
  { id: 2, user_id: 2, user_email: 'fleet@fleet.com', attendance_date: new Date(today - 1*86400000), check_in: '08:15', check_out: '17:00', status: 'Present', location: 'Nairobi HQ' },
  { id: 3, user_id: 3, user_email: 'tech@fleet.com',  attendance_date: new Date(today - 2*86400000), check_in: null,    check_out: null,    status: 'Absent',  location: null          },
  { id: 4, user_id: 3, user_email: 'tech@fleet.com',  attendance_date: new Date(today - 1*86400000), check_in: '09:00', check_out: '17:30', status: 'Present', location: 'Workshop'    },
  { id: 5, user_id: 6, user_email: 'driver@fleet.com',attendance_date: new Date(today - 1*86400000), check_in: '07:45', check_out: '16:30', status: 'Present', location: 'Mombasa'     },
]);
console.log('Attendance seeded (5)');

// ─── Electricity Data ──────────────────────────────────────────────────────────
await db.collection('electricity_data').insertMany([
  { id: 1, reading_date: new Date('2024-09-30'), meter_location: 'Main Building', units_consumed: 3200, cost: 51200 },
  { id: 2, reading_date: new Date('2024-09-30'), meter_location: 'Workshop',      units_consumed: 1800, cost: 28800 },
  { id: 3, reading_date: new Date('2024-10-31'), meter_location: 'Main Building', units_consumed: 3450, cost: 55200 },
  { id: 4, reading_date: new Date('2024-10-31'), meter_location: 'Workshop',      units_consumed: 1950, cost: 31200 },
  { id: 5, reading_date: new Date('2024-11-30'), meter_location: 'Main Building', units_consumed: 3100, cost: 49600 },
  { id: 6, reading_date: new Date('2024-11-30'), meter_location: 'Workshop',      units_consumed: 1700, cost: 27200 },
]);
console.log('Electricity data seeded (6)');

// ─── Water Meter Data ──────────────────────────────────────────────────────────
await db.collection('water_meter_data').insertMany([
  { id: 1, reading_date: new Date('2024-09-30'), meter_location: 'Main Building', units_consumed: 420, cost: 8400 },
  { id: 2, reading_date: new Date('2024-09-30'), meter_location: 'Workshop',      units_consumed: 280, cost: 5600 },
  { id: 3, reading_date: new Date('2024-10-31'), meter_location: 'Main Building', units_consumed: 450, cost: 9000 },
  { id: 4, reading_date: new Date('2024-10-31'), meter_location: 'Workshop',      units_consumed: 310, cost: 6200 },
  { id: 5, reading_date: new Date('2024-11-30'), meter_location: 'Main Building', units_consumed: 400, cost: 8000 },
  { id: 6, reading_date: new Date('2024-11-30'), meter_location: 'Workshop',      units_consumed: 260, cost: 5200 },
]);
console.log('Water meter data seeded (6)');

// ─── Alert Thresholds ──────────────────────────────────────────────────────────
await db.collection('alert_thresholds').insertMany([
  { id: 1, module: 'inventory', metric_key: 'low_stock',          threshold_value: 10,     comparison_operator: '<=', is_active: true  },
  { id: 2, module: 'machines',  metric_key: 'maintenance_due_days',threshold_value: 14,    comparison_operator: '<=', is_active: true  },
  { id: 3, module: 'vehicles',  metric_key: 'service_due_days',   threshold_value: 180,    comparison_operator: '>=', is_active: true  },
  { id: 4, module: 'vehicles',  metric_key: 'document_expiry_days',threshold_value: 30,    comparison_operator: '<=', is_active: true  },
  { id: 5, module: 'finance',   metric_key: 'high_spend',         threshold_value: 500000, comparison_operator: '>=', is_active: false },
  { id: 6, module: 'service',   metric_key: 'sla_breach_hours',   threshold_value: 24,     comparison_operator: '<=', is_active: true  },
]);
console.log('Alert thresholds seeded (6)');

// ─── Vehicle Documents ─────────────────────────────────────────────────────────
await db.collection('vehicle_documents').insertMany([
  { id: 1, vehicle_id: 1, document_type: 'Insurance',       document_number: 'INS-2024-001', expiry_date: new Date('2025-03-31'), file_url: null },
  { id: 2, vehicle_id: 1, document_type: 'Road Licence',    document_number: 'RL-2024-001',  expiry_date: new Date('2025-06-30'), file_url: null },
  { id: 3, vehicle_id: 2, document_type: 'Insurance',       document_number: 'INS-2024-002', expiry_date: new Date('2025-01-15'), file_url: null },
  { id: 4, vehicle_id: 3, document_type: 'NTSA Inspection', document_number: 'NTS-2024-003', expiry_date: new Date('2024-12-31'), file_url: null },
  { id: 5, vehicle_id: 4, document_type: 'Insurance',       document_number: 'INS-2024-004', expiry_date: new Date('2025-07-01'), file_url: null },
]);
console.log('Vehicle documents seeded (5)');

// ─── Notifications ─────────────────────────────────────────────────────────────
await db.collection('notifications').insertMany([
  { id: 1, module: 'inventory', title: 'Low stock: Battery 12V 70Ah',    message: 'Current stock (8) is below threshold (10).',          severity: 'High',   is_read: false },
  { id: 2, module: 'vehicles',  title: 'Document expiry soon: Insurance', message: 'KCB 202B document expires in 28 day(s).',              severity: 'High',   is_read: false },
  { id: 3, module: 'service',   title: 'SLA risk for request #2',         message: 'Request has 18 hour(s) remaining before SLA breach.', severity: 'Medium', is_read: true  },
]);
console.log('Notifications seeded (3)');

// ─── Auto-increment counters ───────────────────────────────────────────────────
await db.collection('counters').insertMany([
  { _id: 'vehicles',                    seq: 5  },
  { _id: 'fuel_logs',                   seq: 6  },
  { _id: 'suppliers',                   seq: 3  },
  { _id: 'products',                    seq: 6  },
  { _id: 'purchase_orders',             seq: 3  },
  { _id: 'purchase_order_items',        seq: 6  },
  { _id: 'stock_movements',             seq: 3  },
  { _id: 'grns',                        seq: 2  },
  { _id: 'grn_items',                   seq: 4  },
  { _id: 'service_requests',            seq: 4  },
  { _id: 'service_tasks',              seq: 3  },
  { _id: 'service_spare_parts',         seq: 3  },
  { _id: 'machines',                    seq: 3  },
  { _id: 'machine_service_history',     seq: 3  },
  { _id: 'machine_maintenance_schedules', seq: 3 },
  { _id: 'assets',                      seq: 4  },
  { _id: 'user_attendance',             seq: 5  },
  { _id: 'electricity_data',            seq: 6  },
  { _id: 'water_meter_data',            seq: 6  },
  { _id: 'alert_thresholds',            seq: 6  },
  { _id: 'vehicle_documents',           seq: 5  },
  { _id: 'notifications',               seq: 3  },
  { _id: 'users',                       seq: 7  },
]);
console.log('Counters set');

await mongoose.disconnect();
console.log('\n✅ fleet_new database fully seeded — all collections ready!');
