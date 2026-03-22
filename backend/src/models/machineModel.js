import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const machineSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    machine_code: { type: String },
    machine_name: { type: String, required: true },
    location: { type: String },
    status: { type: String, default: 'Operational' },
    last_service_date: { type: Date },
    next_service_date: { type: Date }
  },
  { timestamps: false, versionKey: false }
);

machineSchema.plugin(autoIncrementPlugin, { modelName: 'machines' });

export const Machine = mongoose.model('Machine', machineSchema, 'machines');
