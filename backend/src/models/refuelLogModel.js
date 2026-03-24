import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const refuelLogSchema = new mongoose.Schema(
  {
    id:              { type: Number, unique: true },
    vehicle_id:      { type: Number, required: true },
    log_date:        { type: Date, required: true },
    odometer:        { type: Number, required: true },
    fuel_volume:     { type: Number, required: true },          // litres
    price_per_litre: { type: Number },
    total_cost:      { type: Number, required: true },
    full_tank:       { type: Boolean, default: false },
    fuel_type:       { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Other'], default: 'Diesel' },
    notes:           { type: String, maxlength: 500 },
    photo_url:       { type: String },                          // Cloudinary URL
    photo_public_id: { type: String },                          // Cloudinary public_id for deletion
    status:          { type: String, enum: ['Active', 'PendingCorrection', 'Approved', 'Rejected'], default: 'Active' },
    // Audit fields
    created_by:      { type: String },                          // userId
    updated_by:      { type: String },
    approved_by:     { type: String },
    approved_at:     { type: Date }
  },
  { timestamps: true, versionKey: false }
);

refuelLogSchema.index({ vehicle_id: 1, log_date: -1 });
refuelLogSchema.index({ created_by: 1 });

refuelLogSchema.plugin(autoIncrementPlugin, { modelName: 'refuel_logs' });

export const RefuelLog = mongoose.model('RefuelLog', refuelLogSchema, 'refuel_logs');
