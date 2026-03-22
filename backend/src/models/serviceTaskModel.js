import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const serviceTaskSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    service_request_id: { type: Number, required: true },
    task_name: { type: String, required: true },
    assigned_technician_id: { type: Number },
    status: { type: String, default: 'Pending' },
    hours_spent: { type: Number, default: 0 },
    labor_cost: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

serviceTaskSchema.plugin(autoIncrementPlugin, { modelName: 'service_tasks' });

export const ServiceTask = mongoose.model('ServiceTask', serviceTaskSchema, 'service_tasks');
