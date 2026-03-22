import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const fuelLogSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    vehicle_id: { type: Number, required: true },
    log_date: { type: Date, required: true },
    fuel_quantity: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    mileage: { type: Number },
    fuel_efficiency: { type: Number }
  },
  { timestamps: false, versionKey: false }
);

fuelLogSchema.plugin(autoIncrementPlugin, { modelName: 'fuel_logs' });

export const FuelLog = mongoose.model('FuelLog', fuelLogSchema, 'fuel_logs');
