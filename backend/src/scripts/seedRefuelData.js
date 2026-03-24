/**
 * Seed sample data for Refuel, CostLog, Reminder, and FuelStation modules.
 *
 * Usage:  node src/scripts/seedRefuelData.js
 *
 * Requires MONGO_URI env variable (or uses default from config/env.js).
 */
const mongoose = require('mongoose');
const { config } = require('../config/env');
const RefuelLog = require('../models/refuelLogModel');
const CostLog = require('../models/costLogModel');
const Reminder = require('../models/reminderModel');
const FuelStation = require('../models/fuelStationModel');

const ADMIN_ID = 'seed-admin';

async function seed() {
  await mongoose.connect(config.MONGO_URI);
  console.log('Connected to MongoDB');

  // -- Refuel Logs --
  const refuels = [
    { vehicle_id: 1, log_date: new Date('2025-06-01'), odometer: 45200, fuel_volume: 42, price_per_litre: 420, total_cost: 17640, fuel_type: 'Diesel', full_tank: true, notes: 'Full fill at station A', status: 'Approved', created_by: ADMIN_ID },
    { vehicle_id: 2, log_date: new Date('2025-06-03'), odometer: 31500, fuel_volume: 35, price_per_litre: 395, total_cost: 13825, fuel_type: 'Petrol 92', full_tank: false, notes: 'Partial fill', status: 'Active', created_by: ADMIN_ID },
    { vehicle_id: 1, log_date: new Date('2025-06-10'), odometer: 45850, fuel_volume: 38, price_per_litre: 422, total_cost: 16036, fuel_type: 'Diesel', full_tank: true, status: 'Active', created_by: ADMIN_ID },
    { vehicle_id: 3, log_date: new Date('2025-06-12'), odometer: 12000, fuel_volume: 25, price_per_litre: 410, total_cost: 10250, fuel_type: 'Petrol 95', full_tank: true, status: 'Approved', created_by: ADMIN_ID }
  ];
  await RefuelLog.deleteMany({});
  await RefuelLog.insertMany(refuels);
  console.log(`Seeded ${refuels.length} refuel logs`);

  // -- Cost Logs --
  const costs = [
    { vehicle_id: 1, cost_type: 'Service', amount: 15000, log_date: new Date('2025-05-20'), notes: 'Full service 50k km', status: 'Approved', created_by: ADMIN_ID },
    { vehicle_id: 2, cost_type: 'Insurance', amount: 85000, log_date: new Date('2025-01-15'), notes: 'Annual insurance renewal', status: 'Approved', created_by: ADMIN_ID },
    { vehicle_id: 1, cost_type: 'Tyre', amount: 48000, log_date: new Date('2025-04-10'), notes: '4 new tyres', status: 'Active', created_by: ADMIN_ID },
    { vehicle_id: 3, cost_type: 'Repair', amount: 7500, log_date: new Date('2025-06-05'), notes: 'Brake pad replacement', status: 'Active', created_by: ADMIN_ID },
    { vehicle_id: 2, cost_type: 'Toll', amount: 1200, log_date: new Date('2025-06-08'), notes: 'Highway toll', status: 'Approved', created_by: ADMIN_ID }
  ];
  await CostLog.deleteMany({});
  await CostLog.insertMany(costs);
  console.log(`Seeded ${costs.length} cost logs`);

  // -- Reminders --
  const reminders = [
    { vehicle_id: 1, title: 'Insurance Renewal', reminder_type: 'Insurance', due_date: new Date('2026-01-15'), recurrence: 'Yearly', notify_before_days: 30, is_completed: false, created_by: ADMIN_ID },
    { vehicle_id: 2, title: 'Oil Change', reminder_type: 'OilChange', due_date: new Date('2025-07-01'), recurrence: 'Quarterly', notify_before_days: 7, is_completed: false, created_by: ADMIN_ID },
    { vehicle_id: 1, title: 'Tyre Rotation', reminder_type: 'TyreChange', due_date: new Date('2025-06-25'), recurrence: 'Monthly', notify_before_days: 3, is_completed: false, created_by: ADMIN_ID },
    { vehicle_id: 3, title: 'Annual Inspection', reminder_type: 'Inspection', due_date: new Date('2025-09-01'), recurrence: 'Yearly', notify_before_days: 14, is_completed: false, created_by: ADMIN_ID }
  ];
  await Reminder.deleteMany({});
  await Reminder.insertMany(reminders);
  console.log(`Seeded ${reminders.length} reminders`);

  // -- Fuel Stations --
  const stations = [
    { name: 'IOC Colombo 07', address: 'Bauddhaloka Mawatha, Colombo 07', latitude: 6.9022, longitude: 79.8614, is_favorite: true, created_by: ADMIN_ID },
    { name: 'Lanka Petrol - Kaduwela', address: 'Avissawella Rd, Kaduwela', latitude: 6.9307, longitude: 79.9825, is_favorite: false, created_by: ADMIN_ID },
    { name: 'Ceypetco Kandy', address: 'Peradeniya Rd, Kandy', latitude: 7.2906, longitude: 80.6337, is_favorite: true, created_by: ADMIN_ID }
  ];
  await FuelStation.deleteMany({});
  await FuelStation.insertMany(stations);
  console.log(`Seeded ${stations.length} fuel stations`);

  await mongoose.disconnect();
  console.log('Done – disconnected');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
