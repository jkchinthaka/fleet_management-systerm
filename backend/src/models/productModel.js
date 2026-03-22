import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    sku: { type: String },
    product_name: { type: String, required: true },
    category: { type: String },
    unit_price: { type: Number, default: 0 },
    current_stock: { type: Number, default: 0 },
    reorder_level: { type: Number, default: 0 }
  },
  { timestamps: false, versionKey: false }
);

productSchema.plugin(autoIncrementPlugin, { modelName: 'products' });

export const Product = mongoose.model('Product', productSchema, 'products');
