import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const grnSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    purchase_order_id: { type: Number, required: true },
    grn_date: { type: Date },
    received_by: { type: String }
  },
  { timestamps: false, versionKey: false }
);

grnSchema.plugin(autoIncrementPlugin, { modelName: 'grns' });

export const Grn = mongoose.model('Grn', grnSchema, 'grns');
