import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const serviceSparePartSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    service_task_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    unit_cost: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

serviceSparePartSchema.plugin(autoIncrementPlugin, { modelName: 'service_spare_parts' });

export const ServiceSparePart = mongoose.model('ServiceSparePart', serviceSparePartSchema, 'service_spare_parts');
