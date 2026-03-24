import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const costLogSchema = new mongoose.Schema(
  {
    id:             { type: Number, unique: true },
    vehicle_id:     { type: Number, required: true },
    cost_type:      { type: String, required: true, enum: ['Service', 'Repair', 'Insurance', 'Registration', 'Toll', 'Parking', 'Tyre', 'Other'] },
    amount:         { type: Number, required: true },
    log_date:       { type: Date, required: true },
    notes:          { type: String, maxlength: 500 },
    attachment_url: { type: String },                    // Cloudinary URL
    attachment_public_id: { type: String },
    status:         { type: String, enum: ['Active', 'PendingCorrection', 'Approved', 'Rejected'], default: 'Active' },
    // Audit fields
    created_by:     { type: String },
    updated_by:     { type: String },
    approved_by:    { type: String },
    approved_at:    { type: Date }
  },
  { timestamps: true, versionKey: false }
);

costLogSchema.index({ vehicle_id: 1, log_date: -1 });
costLogSchema.index({ created_by: 1 });
costLogSchema.index({ cost_type: 1 });

costLogSchema.plugin(autoIncrementPlugin, { modelName: 'cost_logs' });

export const CostLog = mongoose.model('CostLog', costLogSchema, 'cost_logs');
