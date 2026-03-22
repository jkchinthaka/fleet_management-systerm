import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const purchaseOrderSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    supplier_id: { type: Number, required: true },
    order_date: { type: Date },
    expected_date: { type: Date },
    status: { type: String, default: 'Pending' },
    total_amount: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

purchaseOrderSchema.plugin(autoIncrementPlugin, { modelName: 'purchase_orders' });

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema, 'purchase_orders');
