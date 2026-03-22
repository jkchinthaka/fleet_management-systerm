/**
 * Clears all demo data from every collection in Fleet_New.
 * Keeps the collections and indexes intact — just removes all documents.
 * Resets auto-increment counters to 0.
 *
 * Run: docker exec fleet-backend node src/scripts/clearData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'Fleet_New';

if (!ATLAS_URI) {
  throw new Error('Missing MONGODB_URI. Set it in environment before running clearData.js');
}

await mongoose.connect(ATLAS_URI, { dbName: DB_NAME });
console.log(`Connected to ${DB_NAME}`);

const db = mongoose.connection.db;

const DATA_COLLECTIONS = [
  'vehicles', 'fuel_logs', 'suppliers', 'products',
  'purchase_orders', 'purchase_order_items', 'grns', 'grn_items',
  'stock_movements', 'service_requests', 'service_tasks', 'service_spare_parts',
  'machines', 'machine_service_history', 'machine_maintenance_schedules',
  'assets', 'user_attendance', 'electricity_data', 'water_meter_data',
  'alert_thresholds', 'vehicle_documents', 'notifications',
];

for (const name of DATA_COLLECTIONS) {
  const result = await db.collection(name).deleteMany({});
  console.log(`  ${name}: ${result.deletedCount} documents removed`);
}

// Reset all auto-increment counters to 0
await db.collection('counters').updateMany({}, { $set: { seq: 0 } });
console.log('  counters: all sequences reset to 0');

await mongoose.disconnect();
console.log('\n✅ All demo data cleared. Users are preserved.');
