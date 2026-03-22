import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const supplierSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    supplier_name: { type: String, required: true },
    contact_email: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  { timestamps: false, versionKey: false }
);

supplierSchema.plugin(autoIncrementPlugin, { modelName: 'suppliers' });

export const Supplier = mongoose.model('Supplier', supplierSchema, 'suppliers');
