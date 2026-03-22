import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const electricityDataSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    reading_date: { type: Date, required: true },
    meter_location: { type: String },
    units_consumed: { type: Number, default: 0 },
    cost: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

electricityDataSchema.plugin(autoIncrementPlugin, { modelName: 'electricity_data' });

export const ElectricityData = mongoose.model('ElectricityData', electricityDataSchema, 'electricity_data');
