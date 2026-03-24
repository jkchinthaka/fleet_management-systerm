import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const fuelStationSchema = new mongoose.Schema(
  {
    id:          { type: Number, unique: true },
    name:        { type: String, required: true, maxlength: 200 },
    address:     { type: String, maxlength: 400 },
    latitude:    { type: Number },
    longitude:   { type: Number },
    is_favorite: { type: Boolean, default: false },
    created_by:  { type: String }
  },
  { timestamps: true, versionKey: false }
);

fuelStationSchema.index({ name: 1 });

fuelStationSchema.plugin(autoIncrementPlugin, { modelName: 'fuel_stations' });

export const FuelStation = mongoose.model('FuelStation', fuelStationSchema, 'fuel_stations');
