import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const grnItemSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    grn_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    quantity_received: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

grnItemSchema.plugin(autoIncrementPlugin, { modelName: 'grn_items' });

export const GrnItem = mongoose.model('GrnItem', grnItemSchema, 'grn_items');
