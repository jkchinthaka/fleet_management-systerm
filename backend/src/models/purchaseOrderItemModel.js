import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const purchaseOrderItemSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    purchase_order_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    line_total: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

purchaseOrderItemSchema.plugin(autoIncrementPlugin, { modelName: 'purchase_order_items' });

export const PurchaseOrderItem = mongoose.model('PurchaseOrderItem', purchaseOrderItemSchema, 'purchase_order_items');
