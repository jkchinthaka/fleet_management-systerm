import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const serviceRequestSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Pending' },
    assigned_technician_id: { type: Number },
    sla_deadline: { type: Date },
    total_cost: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false }
);

serviceRequestSchema.plugin(autoIncrementPlugin, { modelName: 'service_requests' });

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema, 'service_requests');
