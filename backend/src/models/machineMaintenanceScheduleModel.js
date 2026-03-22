import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const machineMaintenanceScheduleSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    machine_id: { type: Number, required: true },
    due_date: { type: Date },
    maintenance_type: { type: String },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Pending' }
  },
  { timestamps: false, versionKey: false }
);

machineMaintenanceScheduleSchema.plugin(autoIncrementPlugin, { modelName: 'machine_maintenance_schedules' });

export const MachineMaintenanceSchedule = mongoose.model('MachineMaintenanceSchedule', machineMaintenanceScheduleSchema, 'machine_maintenance_schedules');
