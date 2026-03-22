import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const machineServiceHistorySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    machine_id: { type: Number, required: true },
    service_date: { type: Date },
    description: { type: String },
    service_cost: { type: Number, default: 0 },
    technician: { type: String }
  },
  { timestamps: false, versionKey: false }
);

machineServiceHistorySchema.plugin(autoIncrementPlugin, { modelName: 'machine_service_history' });

export const MachineServiceHistory = mongoose.model('MachineServiceHistory', machineServiceHistorySchema, 'machine_service_history');
