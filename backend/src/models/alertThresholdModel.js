import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const alertThresholdSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    module: { type: String, required: true },
    metric_key: { type: String, required: true },
    threshold_value: { type: Number, required: true },
    comparison_operator: { type: String, required: true },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: false, versionKey: false }
);

alertThresholdSchema.plugin(autoIncrementPlugin, { modelName: 'alert_thresholds' });

export const AlertThreshold = mongoose.model('AlertThreshold', alertThresholdSchema, 'alert_thresholds');
