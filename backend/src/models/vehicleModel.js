import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const vehicleSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    registration_number: { type: String, required: true },
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    status: { type: String, default: 'Active' },
    branch: { type: String },
    last_service_date: { type: Date }
  },
  { timestamps: false, versionKey: false }
);

vehicleSchema.plugin(autoIncrementPlugin, { modelName: 'vehicles' });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema, 'vehicles');
