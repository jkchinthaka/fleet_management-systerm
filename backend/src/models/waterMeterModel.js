import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const waterMeterDataSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    reading_date: { type: Date, required: true },
    meter_location: { type: String },
    units_consumed: { type: Number, default: 0 },
    cost: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

waterMeterDataSchema.plugin(autoIncrementPlugin, { modelName: 'water_meter_data' });

export const WaterMeterData = mongoose.model('WaterMeterData', waterMeterDataSchema, 'water_meter_data');
