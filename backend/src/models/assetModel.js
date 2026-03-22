import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const assetSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    asset_tag: { type: String },
    asset_name: { type: String, required: true },
    category: { type: String },
    location: { type: String },
    purchase_date: { type: Date },
    status: { type: String, default: 'Active' }
  },
  { timestamps: false, versionKey: false }
);

assetSchema.plugin(autoIncrementPlugin, { modelName: 'assets' });

export const Asset = mongoose.model('Asset', assetSchema, 'assets');
